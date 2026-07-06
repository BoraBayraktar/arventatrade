import { z } from "zod";

import { redisCache } from "@/lib/redis";
import type {
  AdminAnswerProductQuestionInput,
  AdminCategoryListItem,
  AdminCategoryListQuery,
  AdminCategoryListResult,
  AdminCreateCategoryInput,
  AdminCreateProductInput,
  AdminProductQuestionItem,
  AdminProductQuestionListQuery,
  AdminProductQuestionListResult,
  AdminProductListItem,
  AdminProductListQuery,
  AdminProductListResult,
  AdminTopInteractionItem,
  AdminUpdateCategoryInput,
  AdminUpdateProductInput,
} from "@/modules/catalog/contracts/catalog-admin.contract";
import { CatalogAdminRepository } from "@/modules/catalog/repositories/catalog-admin.repository";
import {
  decodeProductDescriptionWithFeatures,
  encodeProductDescriptionWithFeatures,
  sanitizeFeatures,
} from "@/modules/catalog/services/product-features.codec";

const productFeatureSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().trim().min(1),
  highlighted: z.boolean().default(false),
});

const adminListQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createProductSchema = z.object({
  slug: z.string().trim().min(3),
  sku: z.string().trim().min(3).max(64),
  name: z.string().trim().min(2),
  description: z.string().trim().min(3),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  currency: z.string().trim().min(3).max(3).optional(),
  imageUrl: z.string().trim().url(),
  features: z.array(productFeatureSchema).max(50).optional().default([]),
  categoryId: z.string().trim().optional().nullable(),
}).refine((value) => value.compareAtPrice == null || value.compareAtPrice > value.price, {
  message: "Compare-at price must be greater than price",
  path: ["compareAtPrice"],
});

const updateProductSchema = z.object({
  id: z.string().trim().min(1),
  slug: z.string().trim().min(3).optional(),
  sku: z.string().trim().min(3).max(64).optional(),
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().min(3).optional(),
  price: z.coerce.number().positive().optional(),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  imageUrl: z.string().trim().url().optional(),
  features: z.array(productFeatureSchema).max(50).optional(),
  categoryId: z.string().trim().optional().nullable(),
});

const categoryListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const questionListQuerySchema = z.object({
  status: z.enum(["all", "pending", "answered"]).default("all"),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const answerQuestionSchema = z.object({
  id: z.string().trim().min(1),
  answer: z.string().trim().min(3).max(2000),
  answeredBy: z.string().trim().min(2).max(120),
});

const createCategorySchema = z.object({
  slug: z.string().trim().min(2),
  name: z.string().trim().min(2),
  parentId: z.string().trim().min(1).optional().nullable(),
});

const updateCategorySchema = z
  .object({
    id: z.string().trim().min(1),
    slug: z.string().trim().min(2).optional(),
    name: z.string().trim().min(2).optional(),
    parentId: z.string().trim().min(1).optional().nullable(),
  })
  .refine((value) => value.slug !== undefined || value.name !== undefined || value.parentId !== undefined, {
    message: "At least one category field must be provided",
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
  categoryId: string | null;
  category: { name: string } | null;
}): AdminProductListItem {
  const { cleanDescription, features } = decodeProductDescriptionWithFeatures(product.description);
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
    description: cleanDescription,
    price,
    compareAtPrice,
    discountRate,
    stock: product.stock,
    inStock: product.stock > 0,
    currency: product.currency,
    imageUrl: product.imageUrl,
    features,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
  };
}

function mapCategory(category: {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  _count: {
    products: number;
  };
}, parentName: string | null): AdminCategoryListItem {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    parentId: category.parentId,
    parentName,
    productCount: category._count.products,
  };
}

function mapTopInteraction(item: {
  productId: string;
  viewCount: number;
  lastViewedAt: Date | null;
  product: {
    slug: string;
    name: string;
    imageUrl: string;
  };
}): AdminTopInteractionItem {
  return {
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    imageUrl: item.product.imageUrl,
    viewCount: item.viewCount,
    lastViewedAt: item.lastViewedAt ? item.lastViewedAt.toISOString() : null,
  };
}

function mapProductQuestion(item: {
  id: string;
  question: string;
  askedBy: string;
  createdAt: Date;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: Date | null;
  product: {
    id: string;
    slug: string;
    name: string;
  };
}): AdminProductQuestionItem {
  return {
    id: item.id,
    productId: item.product.id,
    productSlug: item.product.slug,
    productName: item.product.name,
    question: item.question,
    askedBy: item.askedBy,
    askedAt: item.createdAt.toISOString(),
    answer: item.answer,
    answeredBy: item.answeredBy,
    answeredAt: item.answeredAt ? item.answeredAt.toISOString() : null,
    isAnswered: item.answer != null,
  };
}

export class CatalogCategoryDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogCategoryDeleteError";
  }
}

async function invalidateCatalogCache() {
  await Promise.all([
    redisCache.delByPrefix("catalog:list:"),
    redisCache.delByPrefix("catalog:detail:"),
    redisCache.del("catalog:categories"),
  ]);
}

async function invalidateProductDetailCache(slug: string) {
  await redisCache.del(`catalog:detail:${slug}`);
}

export class CatalogAdminService {
  constructor(private readonly repository: CatalogAdminRepository) {}

  private async assertValidParentAssignment(categoryId: string | null, parentId: string | null | undefined) {
    if (parentId == null) {
      return;
    }

    if (categoryId != null && parentId === categoryId) {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["parentId"],
          message: "Category cannot be parent of itself",
        },
      ]);
    }

    const visited = new Set<string>();
    let cursor: string | null = parentId;

    while (cursor != null) {
      if (visited.has(cursor)) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["parentId"],
            message: "Invalid category hierarchy",
          },
        ]);
      }

      visited.add(cursor);

      const category = await this.repository.findActiveCategoryById(cursor);
      if (!category) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["parentId"],
            message: "Parent category not found",
          },
        ]);
      }

      if (categoryId != null && category.id === categoryId) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["parentId"],
            message: "Category hierarchy would create a cycle",
          },
        ]);
      }

      cursor = category.parentId;
    }
  }

  async listProducts(query: AdminProductListQuery): Promise<AdminProductListResult> {
    const parsed = adminListQuerySchema.parse(query);

    const [products, total] = await Promise.all([
      this.repository.listProducts(parsed),
      this.repository.countProducts({
        search: parsed.search,
        categoryId: parsed.categoryId,
      }),
    ]);

    return {
      items: products.map(mapProduct),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }

  async createProduct(input: AdminCreateProductInput): Promise<AdminProductListItem> {
    const parsed = createProductSchema.parse(input);
    const created = await this.repository.createProduct({
      ...parsed,
      description: encodeProductDescriptionWithFeatures(parsed.description, sanitizeFeatures(parsed.features ?? [])),
    });
    await invalidateCatalogCache();
    return mapProduct(created);
  }

  async updateProduct(input: AdminUpdateProductInput): Promise<AdminProductListItem> {
    const parsed = updateProductSchema.parse(input);
    const needsExisting = parsed.price !== undefined
      || parsed.compareAtPrice !== undefined
      || parsed.features !== undefined
      || parsed.description !== undefined;

    const existing = needsExisting
      ? await this.repository.findActiveProductById(parsed.id)
      : null;

    if (needsExisting && !existing) {
      throw new Error("Product not found");
    }

    const existingProduct = existing;

    if (parsed.price !== undefined || parsed.compareAtPrice !== undefined) {
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      const nextPrice = parsed.price ?? existingProduct.price.toNumber();
      const nextCompareAtPrice = parsed.compareAtPrice !== undefined
        ? parsed.compareAtPrice
        : (existingProduct.compareAtPrice?.toNumber() ?? null);

      if (nextCompareAtPrice != null && nextCompareAtPrice <= nextPrice) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["compareAtPrice"],
            message: "Compare-at price must be greater than price",
          },
        ]);
      }
    }

    const payload = {
      ...parsed,
      ...(parsed.features !== undefined || parsed.description !== undefined
        ? {
            description: encodeProductDescriptionWithFeatures(
              parsed.description ?? existing?.description ?? "",
              parsed.features ?? decodeProductDescriptionWithFeatures(existingProduct?.description ?? "").features,
            ),
          }
        : {}),
    };

    const updated = await this.repository.updateProduct(payload);
    await invalidateCatalogCache();
    return mapProduct(updated);
  }

  async softDeleteProduct(productId: string, deletedUserId: string) {
    await this.repository.softDeleteProduct(productId, deletedUserId);
    await invalidateCatalogCache();
  }

  async listCategories(query: AdminCategoryListQuery): Promise<AdminCategoryListResult> {
    const parsed = categoryListQuerySchema.parse(query);

    const [categories, total] = await Promise.all([
      this.repository.listCategories(parsed),
      this.repository.countCategories({
        search: parsed.search,
      }),
    ]);

    const parentIds = Array.from(
      new Set(categories.map((category) => category.parentId).filter((id): id is string => id != null)),
    );
    const parents = await this.repository.listActiveCategoriesByIds(parentIds);
    const parentNameById = new Map(parents.map((parent) => [parent.id, parent.name]));

    return {
      items: categories.map((category) => mapCategory(category, category.parentId ? (parentNameById.get(category.parentId) ?? null) : null)),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }

  async createCategory(input: AdminCreateCategoryInput): Promise<AdminCategoryListItem> {
    const parsed = createCategorySchema.parse(input);
    await this.assertValidParentAssignment(null, parsed.parentId);
    const created = await this.repository.createCategory(parsed);
    await invalidateCatalogCache();
    const parent = created.parentId
      ? (await this.repository.listActiveCategoriesByIds([created.parentId]))[0] ?? null
      : null;
    return mapCategory(created, parent?.name ?? null);
  }

  async updateCategory(input: AdminUpdateCategoryInput): Promise<AdminCategoryListItem> {
    const parsed = updateCategorySchema.parse(input);

    await this.assertValidParentAssignment(parsed.id, parsed.parentId);

    const updated = await this.repository.updateCategory(parsed);
    await invalidateCatalogCache();
    const parent = updated.parentId
      ? (await this.repository.listActiveCategoriesByIds([updated.parentId]))[0] ?? null
      : null;
    return mapCategory(updated, parent?.name ?? null);
  }

  async softDeleteCategory(categoryId: string, deletedUserId: string) {
    const activeProducts = await this.repository.countActiveProductsByCategoryId(categoryId);
    if (activeProducts > 0) {
      throw new CatalogCategoryDeleteError("Category has active products");
    }

    await this.repository.softDeleteCategory(categoryId, deletedUserId);
    await invalidateCatalogCache();
  }

  async listTopProductInteractions(limit = 6): Promise<AdminTopInteractionItem[]> {
    const rows = await this.repository.listTopProductInteractions(limit);
    return rows.map(mapTopInteraction);
  }

  async listProductQuestions(query: AdminProductQuestionListQuery): Promise<AdminProductQuestionListResult> {
    const parsed = questionListQuerySchema.parse(query);

    const [rows, total] = await Promise.all([
      this.repository.listProductQuestions(parsed),
      this.repository.countProductQuestions(parsed),
    ]);

    return {
      items: rows.map(mapProductQuestion),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }

  async answerProductQuestion(input: AdminAnswerProductQuestionInput): Promise<AdminProductQuestionItem> {
    const parsed = answerQuestionSchema.parse(input);
    const updated = await this.repository.answerProductQuestion(parsed);
    await invalidateProductDetailCache(updated.product.slug);
    return mapProductQuestion(updated);
  }

  async softDeleteProductQuestion(id: string, deletedUserId: string) {
    const deleted = await this.repository.softDeleteProductQuestion(id, deletedUserId);
    await invalidateProductDetailCache(deleted.product.slug);
  }
}

export const catalogAdminService = new CatalogAdminService(new CatalogAdminRepository());
