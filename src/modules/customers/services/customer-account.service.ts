import { z } from "zod";

import type {
  AdminCreateCustomerAccountInput,
  AdminCustomerAccountItem,
} from "@/modules/customers/contracts/customer-account.contract";
import { customerAccountRepository } from "@/modules/customers/repositories/customer-account.repository";

const createCustomerAccountSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160).optional().nullable().or(z.literal("")).transform((value) => value || null),
  phone: z.string().trim().max(64).optional().nullable().or(z.literal("")).transform((value) => value || null),
  taxNumber: z.string().trim().max(64).optional().nullable().or(z.literal("")).transform((value) => value || null),
  address: z.string().trim().max(500).optional().nullable().or(z.literal("")).transform((value) => value || null),
  note: z.string().trim().max(500).optional().nullable().or(z.literal("")).transform((value) => value || null),
  isActive: z.boolean().default(true),
});

function mapCustomerAccount(item: Awaited<ReturnType<typeof customerAccountRepository.listCustomerAccounts>>[number]): AdminCustomerAccountItem {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    email: item.email,
    phone: item.phone,
    taxNumber: item.taxNumber,
    address: item.address,
    note: item.note,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export class CustomerAccountService {
  async listCustomerAccounts(): Promise<AdminCustomerAccountItem[]> {
    const rows = await customerAccountRepository.listCustomerAccounts();
    return rows.map(mapCustomerAccount);
  }

  async createCustomerAccount(input: AdminCreateCustomerAccountInput): Promise<AdminCustomerAccountItem> {
    const parsed = createCustomerAccountSchema.parse(input);
    const created = await customerAccountRepository.createCustomerAccount(parsed);
    return mapCustomerAccount(created);
  }

  async getCustomerAccountById(id: string): Promise<AdminCustomerAccountItem | null> {
    const item = await customerAccountRepository.findCustomerAccountById(id);
    return item ? mapCustomerAccount(item) : null;
  }

  async ensureCustomerAccountFromUserProfile(profile: {
    email: string;
    name: string;
  }): Promise<AdminCustomerAccountItem> {
    const normalizedEmail = profile.email.trim().toLocaleLowerCase("tr-TR");
    const existing = await customerAccountRepository.findCustomerAccountByEmail(normalizedEmail);
    if (existing) {
      return mapCustomerAccount(existing);
    }

    const slugBase = `${profile.name.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, "-")}-${normalizedEmail.split("@")[0]}`.replace(/[^a-z0-9-]/g, "");
    const created = await customerAccountRepository.createCustomerAccount({
      slug: slugBase || `customer-${Date.now()}`,
      name: profile.name.trim(),
      email: normalizedEmail,
      isActive: true,
    });

    return mapCustomerAccount(created);
  }
}

export const customerAccountService = new CustomerAccountService();
