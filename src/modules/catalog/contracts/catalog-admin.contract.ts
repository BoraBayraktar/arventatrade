export type AdminProductListItem = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  discountRate: number | null;
  stock: number;
  inStock: boolean;
  currency: string;
  imageUrl: string;
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
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  currency?: string;
  imageUrl: string;
  categoryId?: string | null;
};

export type AdminUpdateProductInput = {
  id: string;
  slug?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number | null;
  stock?: number;
  currency?: string;
  imageUrl?: string;
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
