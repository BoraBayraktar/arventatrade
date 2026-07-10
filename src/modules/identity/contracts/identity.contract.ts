export type UserRole = "ADMIN" | "EDITOR" | "CUSTOMER";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
  locale?: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type LoginResult = {
  token: string;
  user: AuthUser;
};

export type IdentitySession = {
  sid: string;
  user: AuthUser;
};
