export type AdminCustomerAccountItem = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxNumber: string | null;
  address: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminCreateCustomerAccountInput = {
  slug: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  note?: string | null;
  isActive?: boolean;
};
