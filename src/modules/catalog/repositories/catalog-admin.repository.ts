import { prisma } from "@/lib/prisma";
import type {
  AdminAnswerProductQuestionInput,
  AdminCategoryListQuery,
  AdminProductQuestionListQuery,
  AdminProductListQuery,
  AdminUpdateCategoryInput,
} from "@/modules/catalog/contracts/catalog-admin.contract";

type AdminCreateProductRecordInput = {
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
  currency?: string;
  vatRate?: number;
  stockTrackingEnabled?: boolean;
  preferredSalesWarehouseId?: string | null;
  preferredPurchaseWarehouseId?: string | null;
  imageUrl: string;
  imageUrls?: string[];
  categoryId?: string | null;
};

type AdminUpdateProductRecordInput = {
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
  currency?: string;
  vatRate?: number;
  stockTrackingEnabled?: boolean;
  preferredSalesWarehouseId?: string | null;
  preferredPurchaseWarehouseId?: string | null;
  imageUrl?: string;
  imageUrls?: string[];
  categoryId?: string | null;
};

function buildWhere(args: { search?: string; categoryId?: string }) {
  return {
    deleted: false,
    ...(args.search
      ? {
          OR: [
            { name: { contains: args.search, mode: "insensitive" as const } },
            { slug: { contains: args.search, mode: "insensitive" as const } },
            { description: { contains: args.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(args.categoryId ? { categoryId: args.categoryId } : {}),
  };
}

function buildQuestionWhere(args: AdminProductQuestionListQuery) {
  return {
    deleted: false,
    ...(args.questionId ? { id: args.questionId } : {}),
    ...(args.status === "pending" ? { answer: null } : {}),
    ...(args.status === "answered" ? { answer: { not: null } } : {}),
    ...(args.search
      ? {
          OR: [
            { question: { contains: args.search, mode: "insensitive" as const } },
            { askedBy: { contains: args.search, mode: "insensitive" as const } },
            { product: { name: { contains: args.search, mode: "insensitive" as const } } },
            { product: { slug: { contains: args.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
}

function buildQuestionOrderBy(args: AdminProductQuestionListQuery) {
  switch (args.sort ?? "priority") {
    case "latest":
      return [{ createdAt: "desc" as const }];
    case "oldest":
      return [{ createdAt: "asc" as const }];
    case "priority":
    default:
      return [{ answeredAt: "asc" as const }, { createdAt: "desc" as const }];
  }
}

export class CatalogAdminRepository {
  async listProducts(args: AdminProductListQuery) {
    return prisma.product.findMany({
      where: buildWhere(args),
      include: {
        category: true,
        inventoryItem: {
          select: {
            inventoryLevels: {
              where: {
                warehouse: {
                  isActive: true,
                },
              },
              select: {
                onHand: true,
                reserved: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: ((args.page ?? 1) - 1) * (args.pageSize ?? 10),
      take: args.pageSize,
    });
  }

  async countProducts(args: Pick<AdminProductListQuery, "search" | "categoryId">) {
    return prisma.product.count({
      where: buildWhere(args),
    });
  }

  async createProduct(input: AdminCreateProductRecordInput) {
    return prisma.product.create({
      data: {
        slug: input.slug,
        sku: input.sku,
        barcode: input.barcode ?? null,
        name: input.name,
        description: input.description,
        productType: input.productType ?? "PHYSICAL",
        unitType: input.unitType ?? "PIECE",
        price: input.price,
        purchasePrice: input.purchasePrice ?? null,
        compareAtPrice: input.compareAtPrice ?? null,
        stock: 0,
        currency: input.currency ?? "TRY",
        vatRate: input.vatRate ?? 20,
        stockTrackingEnabled: input.stockTrackingEnabled ?? true,
        preferredSalesWarehouseId: input.preferredSalesWarehouseId ?? null,
        preferredPurchaseWarehouseId: input.preferredPurchaseWarehouseId ?? null,
        imageUrl: input.imageUrl,
        imageUrls: input.imageUrls ?? [],
        categoryId: input.categoryId ?? null,
      },
      include: {
        category: true,
        inventoryItem: {
          select: {
            inventoryLevels: {
              where: {
                warehouse: {
                  isActive: true,
                },
              },
              select: {
                onHand: true,
                reserved: true,
              },
            },
          },
        },
      },
    });
  }

  async updateProduct(input: AdminUpdateProductRecordInput) {
    return prisma.product.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.productType !== undefined ? { productType: input.productType } : {}),
        ...(input.unitType !== undefined ? { unitType: input.unitType } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.purchasePrice !== undefined ? { purchasePrice: input.purchasePrice } : {}),
        ...(input.compareAtPrice !== undefined ? { compareAtPrice: input.compareAtPrice } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.vatRate !== undefined ? { vatRate: input.vatRate } : {}),
        ...(input.stockTrackingEnabled !== undefined ? { stockTrackingEnabled: input.stockTrackingEnabled } : {}),
        ...(input.preferredSalesWarehouseId !== undefined ? { preferredSalesWarehouseId: input.preferredSalesWarehouseId } : {}),
        ...(input.preferredPurchaseWarehouseId !== undefined ? { preferredPurchaseWarehouseId: input.preferredPurchaseWarehouseId } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.imageUrls !== undefined ? { imageUrls: input.imageUrls } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      },
      include: {
        category: true,
        inventoryItem: {
          select: {
            inventoryLevels: {
              where: {
                warehouse: {
                  isActive: true,
                },
              },
              select: {
                onHand: true,
                reserved: true,
              },
            },
          },
        },
      },
    });
  }

  async findActiveProductForAdminById(id: string) {
    return prisma.product.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        category: true,
        inventoryItem: {
          select: {
            inventoryLevels: {
              where: {
                warehouse: {
                  isActive: true,
                },
              },
              select: {
                onHand: true,
                reserved: true,
              },
            },
          },
        },
      },
    });
  }

  async softDeleteProduct(id: string, deletedUserId: string) {
    return prisma.product.update({
      where: {
        id,
      },
      data: {
        deleted: true,
        deletedDate: new Date(),
        deletedUserId,
      },
    });
  }

  async findActiveProductById(id: string) {
    return prisma.product.findFirst({
      where: {
        id,
        deleted: false,
      },
      select: {
        id: true,
        description: true,
        price: true,
        compareAtPrice: true,
        productType: true,
      },
    });
  }

  async listCategories(args: AdminCategoryListQuery) {
    return prisma.category.findMany({
      where: {
        deleted: false,
        ...(args.search
          ? {
              OR: [
                { name: { contains: args.search, mode: "insensitive" as const } },
                { slug: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        parentId: true,
        _count: {
          select: {
            products: {
              where: {
                deleted: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: ((args.page ?? 1) - 1) * (args.pageSize ?? 10),
      take: args.pageSize,
    });
  }

  async countCategories(args: Pick<AdminCategoryListQuery, "search">) {
    return prisma.category.count({
      where: {
        deleted: false,
        ...(args.search
          ? {
              OR: [
                { name: { contains: args.search, mode: "insensitive" as const } },
                { slug: { contains: args.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    });
  }

  async createCategory(input: { slug: string; name: string; parentId?: string | null }) {
    return prisma.category.create({
      data: {
        slug: input.slug,
        name: input.name,
        parentId: input.parentId ?? null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        parentId: true,
        _count: {
          select: {
            products: {
              where: {
                deleted: false,
              },
            },
          },
        },
      },
    });
  }

  async updateCategory(input: AdminUpdateCategoryInput) {
    return prisma.category.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        parentId: true,
        _count: {
          select: {
            products: {
              where: {
                deleted: false,
              },
            },
          },
        },
      },
    });
  }

  async softDeleteCategory(id: string, deletedUserId: string) {
    return prisma.category.update({
      where: {
        id,
      },
      data: {
        deleted: true,
        deletedDate: new Date(),
        deletedUserId,
      },
    });
  }

  async countActiveProductsByCategoryId(categoryId: string) {
    return prisma.product.count({
      where: {
        categoryId,
        deleted: false,
      },
    });
  }

  async findActiveCategoryById(id: string) {
    return prisma.category.findFirst({
      where: {
        id,
        deleted: false,
      },
      select: {
        id: true,
        parentId: true,
      },
    });
  }

  async listActiveCategoriesByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return prisma.category.findMany({
      where: {
        id: {
          in: ids,
        },
        deleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async listTopProductInteractions(limit: number) {
    return prisma.productInteraction.findMany({
      where: {
        product: {
          deleted: false,
        },
      },
      include: {
        product: true,
      },
      orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
      take: limit,
    });
  }

  async listProductQuestions(args: AdminProductQuestionListQuery) {
    return prisma.productQuestion.findMany({
      where: buildQuestionWhere(args),
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: buildQuestionOrderBy(args),
      skip: ((args.page ?? 1) - 1) * (args.pageSize ?? 10),
      take: args.pageSize,
    });
  }

  async countProductQuestions(args: AdminProductQuestionListQuery) {
    return prisma.productQuestion.count({
      where: buildQuestionWhere(args),
    });
  }

  async countProductQuestionsByStatus(status: "pending" | "answered") {
    return prisma.productQuestion.count({
      where: {
        deleted: false,
        ...(status === "pending" ? { answer: null } : { answer: { not: null } }),
      },
    });
  }

  async countOverdueProductQuestions(slaHours: number) {
    const threshold = new Date(Date.now() - Math.max(1, slaHours) * 60 * 60 * 1000);

    return prisma.productQuestion.count({
      where: {
        deleted: false,
        answer: null,
        createdAt: {
          lt: threshold,
        },
      },
    });
  }

  async listProductSlugsByQuestionIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const rows = await prisma.productQuestion.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });

    return rows.map((item) => item.product.slug);
  }

  async answerProductQuestion(input: AdminAnswerProductQuestionInput) {
    return prisma.productQuestion.update({
      where: {
        id: input.id,
      },
      data: {
        answer: input.answer,
        answeredBy: input.answeredBy,
        answeredAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async softDeleteProductQuestion(id: string, deletedUserId: string) {
    return prisma.productQuestion.update({
      where: {
        id,
      },
      data: {
        deleted: true,
        deletedDate: new Date(),
        deletedUserId,
      },
      include: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });
  }

  async bulkAnswerProductQuestions(ids: string[], answer: string, answeredBy: string) {
    if (ids.length === 0) {
      return { count: 0 };
    }

    return prisma.productQuestion.updateMany({
      where: {
        id: {
          in: ids,
        },
        deleted: false,
      },
      data: {
        answer,
        answeredBy,
        answeredAt: new Date(),
      },
    });
  }

  async bulkSoftDeleteProductQuestions(ids: string[], deletedUserId: string) {
    if (ids.length === 0) {
      return { count: 0 };
    }

    return prisma.productQuestion.updateMany({
      where: {
        id: {
          in: ids,
        },
        deleted: false,
      },
      data: {
        deleted: true,
        deletedDate: new Date(),
        deletedUserId,
      },
    });
  }
}
