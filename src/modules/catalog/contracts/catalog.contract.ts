export type ProductSort = "latest" | "price-asc" | "price-desc";

export type ProductFeature = {
  key: string;
  value: string;
  highlighted: boolean;
};

export type ProductFeatureFacetOption = {
  value: string;
  count: number;
};

export type ProductFeatureFacet = {
  key: string;
  options: ProductFeatureFacetOption[];
};

export type ProductRatingDistributionItem = {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
};

export type ProductRatingSummary = {
  average: number;
  count: number;
  distribution: ProductRatingDistributionItem[];
};

export type ProductReview = {
  id: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

export type ProductQuestionAnswer = {
  id: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
};

export type ProductListQuery = {
  search?: string;
  categorySlug?: string;
  sort?: ProductSort;
  inStockOnly?: boolean;
  outOfStockOnly?: boolean;
  lowStockOnly?: boolean;
  newOnly?: boolean;
  discountedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  featureFilters?: string[];
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
  features: ProductFeature[];
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
  featureFacets: ProductFeatureFacet[];
};

export type ProductDetail = ProductCard & {
  ratingSummary: ProductRatingSummary;
  reviews: ProductReview[];
  questions: ProductQuestionAnswer[];
};

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
};
