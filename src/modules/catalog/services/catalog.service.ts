import { z } from "zod";

import { redisCache } from "@/lib/redis";
import type {
  CategoryOption,
  ProductDetail,
  ProductListQuery,
  ProductListResult,
} from "@/modules/catalog/contracts/catalog.contract";
import { CatalogRepository } from "@/modules/catalog/repositories/catalog.repository";

const productListQuerySchema = z.object({
  search: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
});

function mapProduct(product: {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: { toNumber: () => number };
  compareAtPrice: { toNumber: () => number } | null;
  stock: number;
  currency: string;
  imageUrl: string;
  category: { slug: string; name: string } | null;
}): ProductDetail {
  const price = product.price.toNumber();
  const compareAtPrice = product.compareAtPrice?.toNumber() ?? null;
  const discountRate = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price,
    compareAtPrice,
    discountRate,
    stock: product.stock,
    inStock: product.stock > 0,
    currency: product.currency,
    imageUrl: product.imageUrl,
    category: product.category
      ? {
          slug: product.category.slug,
          name: product.category.name,
        }
      : null,
  };
}

export class CatalogService {
  constructor(private readonly repository: CatalogRepository) {}

  private async resolveCategoryIds(categorySlug?: string) {
    if (!categorySlug) {
      return undefined;
    }

    const categories = await this.listCategories();
    const root = categories.find((item) => item.slug === categorySlug);
    if (!root) {
      return [];
    }

    const ids: string[] = [];
    const queue = [root.id];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) {
        continue;
      }

      ids.push(currentId);

      const children = categories.filter((item) => item.parentId === currentId);
      for (const child of children) {
        queue.push(child.id);
      }
    }

    return ids;
  }

  async listProducts(query: ProductListQuery): Promise<ProductListResult> {
    const parsed = productListQuerySchema.parse(query);
    const categoryIds = await this.resolveCategoryIds(parsed.categorySlug);
    const cacheKey = [
      "catalog:list",
      parsed.search ?? "",
      parsed.categorySlug ?? "",
      parsed.page,
      parsed.pageSize,
    ].join(":");

    const cached = await redisCache.get<ProductListResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (parsed.page - 1) * parsed.pageSize;

    const [items, total] = await Promise.all([
      this.repository.findMany({
        search: parsed.search,
        categoryIds,
        skip,
        take: parsed.pageSize,
      }),
      this.repository.count({
        search: parsed.search,
        categoryIds,
      }),
    ]);

    const result: ProductListResult = {
      items: items.map(mapProduct),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };

    await redisCache.set(cacheKey, result, 120);

    return result;
  }

  async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    const cacheKey = `catalog:detail:${slug}`;
    const cached = await redisCache.get<ProductDetail>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.repository.findBySlug(slug);
    if (!product) {
      return null;
    }

    const mapped = mapProduct(product);
    await redisCache.set(cacheKey, mapped, 120);
    return mapped;
  }

  async listCategories(): Promise<CategoryOption[]> {
    const cacheKey = "catalog:categories";
    const cached = await redisCache.get<CategoryOption[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const categories = await this.repository.listCategories();
    await redisCache.set(cacheKey, categories, 600);
    return categories;
  }

  async trackProductView(productId: string): Promise<void> {
    await this.repository.trackProductView(productId);
  }
}

export const catalogService = new CatalogService(new CatalogRepository());
