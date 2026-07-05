import type { Locale } from "@/lib/i18n";

export type StorefrontSectionKey = "HOME_CAMPAIGN" | "HOME_FEATURE";
export type StorefrontVariant = "accent" | "soft" | "dark" | "default";
export type StorefrontTargetType = "PRODUCT" | "CATEGORY";

export type StorefrontTarget =
  | {
      type: "PRODUCT";
      slug: string;
      title: string;
      imageUrl: string;
      price: number;
      currency: string;
    }
  | {
      type: "CATEGORY";
      slug: string;
      title: string;
      imageUrl: string | null;
    };

export type StorefrontItem = {
  id: string;
  section: StorefrontSectionKey;
  variant: StorefrontVariant;
  targetType: StorefrontTargetType | null;
  productId: string | null;
  categoryId: string | null;
  target: StorefrontTarget | null;
  title: string;
  description: string;
  sortOrder: number;
};

export type StorefrontSectionResult = {
  campaigns: StorefrontItem[];
  features: StorefrontItem[];
};

export type AdminStorefrontItem = {
  id: string;
  section: StorefrontSectionKey;
  variant: StorefrontVariant;
  targetType: StorefrontTargetType | null;
  productId: string | null;
  categoryId: string | null;
  productName: string | null;
  categoryName: string | null;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
};

export type UpsertStorefrontItemInput = {
  id?: string;
  section: StorefrontSectionKey;
  variant: StorefrontVariant;
  targetType?: StorefrontTargetType | null;
  productId?: string | null;
  categoryId?: string | null;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type LocalizedStorefrontResolver = {
  locale: Locale;
};
