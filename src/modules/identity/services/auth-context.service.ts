import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import type { AuthUser, UserRole } from "@/modules/identity/contracts/identity.contract";
import { identityService } from "@/modules/identity/services/identity.service";

export class AuthContextError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AuthContextError";
  }
}

export async function getCurrentUserFromContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return identityService.getAuthenticatedUser(token);
}

export async function requireUserRoles(roles: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUserFromContext();

  if (!user) {
    throw new AuthContextError(401, "Unauthorized");
  }

  if (!roles.includes(user.role)) {
    throw new AuthContextError(403, "Forbidden");
  }

  return user;
}
