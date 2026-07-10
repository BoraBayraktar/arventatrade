import { randomUUID } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

import { redisCache } from "@/lib/redis";
import { AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { logError, logInfo } from "@/lib/observability";
import type {
  AuthUser,
  ForgotPasswordInput,
  IdentitySession,
  LoginInput,
  LoginResult,
  RegisterInput,
  ResetPasswordInput,
} from "@/modules/identity/contracts/identity.contract";
import { IdentityRepository } from "@/modules/identity/repositories/identity.repository";
import { NotificationEmailRepository } from "@/modules/system/repositories/notification-email.repository";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(2),
  password: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
  locale: z.enum(["tr", "en"]).optional(),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(24),
  password: z.string().min(6),
});

type SessionTokenPayload = {
  sid: string;
};

function getJwtSecret() {
  const secret = process.env.AUTH_SECRET ?? "dev-auth-secret-change-me";
  return new TextEncoder().encode(secret);
}

function getSessionCacheKey(sid: string) {
  return `identity:session:${sid}`;
}

function getPasswordResetCacheKey(token: string) {
  return `identity:password-reset:${token}`;
}

function getPasswordResetRateLimitKey(email: string) {
  return `identity:password-reset-rate:${email.toLowerCase()}`;
}

async function signSessionToken(user: AuthUser, sid: string) {
  return new SignJWT({ sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export class IdentityService {
  constructor(
    private readonly repository: IdentityRepository,
    private readonly emailRepository: NotificationEmailRepository,
  ) {}

  async register(input: RegisterInput): Promise<LoginResult> {
    const parsed = registerSchema.parse(input);
    const existing = await this.repository.findByEmail(parsed.email);

    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hash(parsed.password, 10);
    const created = await this.repository.createCustomer({
      email: parsed.email,
      name: parsed.name,
      passwordHash,
    });

    const user: AuthUser = {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
    };

    const sid = randomUUID();
    const token = await signSessionToken(user, sid);

    const session: IdentitySession = {
      sid,
      user,
    };

    await redisCache.set(getSessionCacheKey(sid), session, AUTH_TOKEN_TTL_SECONDS);

    return {
      token,
      user,
    };
  }

  async login(input: LoginInput): Promise<LoginResult | null> {
    const parsed = loginSchema.parse(input);
    const account = await this.repository.findByEmail(parsed.email);

    if (!account) {
      return null;
    }

    const valid = await compare(parsed.password, account.passwordHash);
    if (!valid) {
      return null;
    }

    const user: AuthUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
    };

    const sid = randomUUID();
    const token = await signSessionToken(user, sid);

    const session: IdentitySession = {
      sid,
      user,
    };

    await redisCache.set(getSessionCacheKey(sid), session, AUTH_TOKEN_TTL_SECONDS);

    return {
      token,
      user,
    };
  }

  async getAuthenticatedUser(token?: string): Promise<AuthUser | null> {
    if (!token) {
      return null;
    }

    try {
      const verification = await jwtVerify<SessionTokenPayload>(token, getJwtSecret());
      const sid = verification.payload.sid;
      const userId = verification.payload.sub;

      if (!sid || !userId) {
        return null;
      }

      const cachedSession = await redisCache.get<IdentitySession>(getSessionCacheKey(sid));
      if (cachedSession?.user) {
        return cachedSession.user;
      }

      const account = await this.repository.findById(userId);
      if (!account) {
        return null;
      }

      const user: AuthUser = {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
      };

      await redisCache.set(
        getSessionCacheKey(sid),
        {
          sid,
          user,
        },
        AUTH_TOKEN_TTL_SECONDS,
      );

      return user;
    } catch {
      return null;
    }
  }

  async logout(token?: string) {
    if (!token) {
      return;
    }

    try {
      const verification = await jwtVerify<SessionTokenPayload>(token, getJwtSecret());
      const sid = verification.payload.sid;
      if (!sid) {
        return;
      }

      await redisCache.del(getSessionCacheKey(sid));
    } catch {
      return;
    }
  }

  async requestPasswordReset(input: ForgotPasswordInput) {
    const parsed = forgotPasswordSchema.parse(input);
    const email = parsed.email.toLowerCase();
    const rateLimitKey = getPasswordResetRateLimitKey(email);
    const existingRequest = await redisCache.get<string>(rateLimitKey);

    if (existingRequest) {
      return { ok: true };
    }

    const account = await this.repository.findByEmail(email);
    await redisCache.set(rateLimitKey, "1", 60);

    if (!account) {
      return { ok: true };
    }

    const token = `${randomUUID()}${randomUUID().replace(/-/g, "")}`;
    const locale = parsed.locale ?? "tr";
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/${locale}/reset-password?token=${encodeURIComponent(token)}`;

    await redisCache.set(
      getPasswordResetCacheKey(token),
      { userId: account.id, email: account.email },
      60 * 30,
    );

    const subject = locale === "tr" ? "2BEM sifre sifirlama baglantisi" : "2BEM password reset link";
    const text = locale === "tr"
      ? `Merhaba ${account.name},\n\nSifrenizi sifirlamak icin asagidaki baglantiyi kullanin:\n${resetUrl}\n\nBu baglanti 30 dakika boyunca gecerlidir.\nEger bu islemi siz baslatmadiysaniz bu e-postayi yok sayabilirsiniz.`
      : `Hello ${account.name},\n\nUse the link below to reset your password:\n${resetUrl}\n\nThis link is valid for 30 minutes.\nIf you did not request this, you can ignore this email.`;

    try {
      await this.emailRepository.send({
        to: account.email,
        subject,
        text,
      });
      logInfo("Password reset email queued", {
        scope: "identity.password-reset",
        userId: account.id,
      });
    } catch (error) {
      logError("Password reset email failed", {
        scope: "identity.password-reset",
        userId: account.id,
        error: error instanceof Error ? error.message : "UNKNOWN",
      });
    }

    return { ok: true };
  }

  async resetPassword(input: ResetPasswordInput) {
    const parsed = resetPasswordSchema.parse(input);
    const payload = await redisCache.get<{ userId: string; email: string }>(getPasswordResetCacheKey(parsed.token));

    if (!payload?.userId) {
      throw new Error("PASSWORD_RESET_TOKEN_INVALID");
    }

    const passwordHash = await hash(parsed.password, 10);
    await this.repository.updatePasswordById(payload.userId, passwordHash);
    await redisCache.del(getPasswordResetCacheKey(parsed.token));

    logInfo("Password reset completed", {
      scope: "identity.password-reset",
      userId: payload.userId,
    });

    return { ok: true };
  }
}

export const identityService = new IdentityService(
  new IdentityRepository(),
  new NotificationEmailRepository(),
);
