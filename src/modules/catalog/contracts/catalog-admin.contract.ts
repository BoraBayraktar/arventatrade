import type { ProductFeature } from "@/modules/catalog/contracts/catalog.contract";

export type AdminProductListItem = {
  id: string;
  slug: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string;
  productType: "PHYSICAL" | "SERVICE" | "RAW_MATERIAL" | "SEMI_FINISHED";
  unitType: "PIECE" | "KILOGRAM" | "GRAM" | "LITER" | "MILLILITER" | "METER" | "CENTIMETER" | "BOX" | "PACK";
  price: number;
  purchasePrice: number | null;
  compareAtPrice: number | null;
  discountRate: number | null;
  stock: number;
  inStock: boolean;
  currency: string;
  vatRate: number;
  stockTrackingEnabled: boolean;
  preferredSalesWarehouseId: string | null;
  preferredPurchaseWarehouseId: string | null;
  imageUrl: string;
  imageUrls: string[];
  features: ProductFeature[];
  categoryId: string | null;
  categoryName: string | null;
};

export type AdminProductListQuery = {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
};

export type AdminProductListResult = {
  items: AdminProductListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminCreateProductInput = {
  slug: string;
  sku: string;
  barcode?: string | null;
  name: string;
  description: string;
  productType?: "PHYSICAL" | "SERVICE" | "RAW_MATERIAL" | "SEMI_FINISHED";
  unitType?: "PIECE" | "KILOGRAM" | "GRAM" | "LITER" | "MILLILITER" | "METER" | "CENTIMETER" | "BOX" | "PACK";
  price: number;
  purchasePrice?: number | null;
  compareAtPrice?: number | null;
  stock: number;
  currency?: string;
  vatRate?: number;
  stockTrackingEnabled?: boolean;
  preferredSalesWarehouseId?: string | null;
  preferredPurchaseWarehouseId?: string | null;
  imageUrl: string;
  imageUrls?: string[];
  features?: ProductFeature[];
  categoryId?: string | null;
};

export type AdminUpdateProductInput = {
  id: string;
  slug?: string;
  sku?: string;
  barcode?: string | null;
  name?: string;
  description?: string;
  productType?: "PHYSICAL" | "SERVICE" | "RAW_MATERIAL" | "SEMI_FINISHED";
  unitType?: "PIECE" | "KILOGRAM" | "GRAM" | "LITER" | "MILLILITER" | "METER" | "CENTIMETER" | "BOX" | "PACK";
  price?: number;
  purchasePrice?: number | null;
  compareAtPrice?: number | null;
  stock?: number;
  currency?: string;
  vatRate?: number;
  stockTrackingEnabled?: boolean;
  preferredSalesWarehouseId?: string | null;
  preferredPurchaseWarehouseId?: string | null;
  imageUrl?: string;
  imageUrls?: string[];
  features?: ProductFeature[];
  categoryId?: string | null;
};

export type AdminCategoryListItem = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
};

export type AdminCategoryListQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AdminCategoryListResult = {
  items: AdminCategoryListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminCreateCategoryInput = {
  slug: string;
  name: string;
  parentId?: string | null;
};

export type AdminUpdateCategoryInput = {
  id: string;
  slug?: string;
  name?: string;
  parentId?: string | null;
};

export type AdminTopInteractionItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  viewCount: number;
  lastViewedAt: string | null;
};

export type AdminProductQuestionStatus = "all" | "pending" | "answered";
export type AdminProductQuestionSort = "priority" | "latest" | "oldest";

export type AdminProductQuestionItem = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
  isAnswered: boolean;
};

export type AdminProductQuestionListQuery = {
  status?: AdminProductQuestionStatus;
  sort?: AdminProductQuestionSort;
  search?: string;
  questionId?: string;
  page?: number;
  pageSize?: number;
};

export type AdminProductQuestionListResult = {
  items: AdminProductQuestionItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminAnswerProductQuestionInput = {
  id: string;
  answer: string;
  answeredBy: string;
};

export type AdminBulkProductQuestionAction = "answer" | "delete";

export type AdminBulkModerateProductQuestionsInput = {
  ids: string[];
  action: AdminBulkProductQuestionAction;
  answer?: string;
  answeredBy?: string;
  deletedUserId?: string;
};

export type AdminProductQuestionModerationResult = {
  affected: number;
};

export type AdminProductQuestionStats = {
  total: number;
  pending: number;
  answered: number;
  overdue: number;
  slaHours: number;
};
