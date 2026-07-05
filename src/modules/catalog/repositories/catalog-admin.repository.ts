import { prisma } from "@/lib/prisma";
import type {
  AdminCategoryListQuery,
  AdminCreateProductInput,
  AdminProductListQuery,
  AdminUpdateCategoryInput,
  AdminUpdateProductInput,
} from "@/modules/catalog/contracts/catalog-admin.contract";

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

export class CatalogAdminRepository {
  async listProducts(args: AdminProductListQuery) {
    return prisma.product.findMany({
      where: buildWhere(args),
      include: {
        category: true,
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

  async createProduct(input: AdminCreateProductInput) {
    return prisma.product.create({
      data: {
        slug: input.slug,
        sku: input.sku,
        name: input.name,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        stock: input.stock,
        currency: input.currency ?? "TRY",
        imageUrl: input.imageUrl,
        categoryId: input.categoryId ?? null,
      },
      include: {
        category: true,
      },
    });
  }

  async updateProduct(input: AdminUpdateProductInput) {
    return prisma.product.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.compareAtPrice !== undefined ? { compareAtPrice: input.compareAtPrice } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      },
      include: {
        category: true,
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
        price: true,
        compareAtPrice: true,
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
}
