import { randomUUID } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

import { redisCache } from "@/lib/redis";
import { AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth";
import type {
  AuthUser,
  IdentitySession,
  LoginInput,
  LoginResult,
  RegisterInput,
} from "@/modules/identity/contracts/identity.contract";
import { IdentityRepository } from "@/modules/identity/repositories/identity.repository";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(2),
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

async function signSessionToken(user: AuthUser, sid: string) {
  return new SignJWT({ sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export class IdentityService {
  constructor(private readonly repository: IdentityRepository) {}

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
}

export const identityService = new IdentityService(new IdentityRepository());
