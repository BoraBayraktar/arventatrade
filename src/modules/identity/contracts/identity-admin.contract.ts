import type { UserRole } from "@/modules/identity/contracts/identity.contract";

export type AdminUserListItem = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export type AdminUserListQuery = {
  search?: string;
  role?: UserRole;
  page?: number;
  pageSize?: number;
};

export type AdminUserListResult = {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminCreateUserInput = {
  email: string;
  name: string;
  role: UserRole;
  password: string;
};

export type AdminUpdateUserInput = {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole;
  password?: string;
};
