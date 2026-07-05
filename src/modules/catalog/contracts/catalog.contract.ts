export type ProductListQuery = {
  search?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
};

export type ProductCard = {
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
  category: {
    slug: string;
    name: string;
  } | null;
};

export type ProductListResult = {
  items: ProductCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductDetail = ProductCard;

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
};
