import { prisma } from "@/lib/prisma";

type FindManyArgs = {
  search?: string;
  categoryIds?: string[];
  skip: number;
  take: number;
};

type CountArgs = {
  search?: string;
  categoryIds?: string[];
};

function buildWhere(args: { search?: string; categoryIds?: string[] }) {
  const { search, categoryIds } = args;

  return {
    deleted: false,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categoryIds
      ? {
          categoryId: {
            in: categoryIds,
          },
        }
      : {}),
  };
}

export class CatalogRepository {
  async findMany(args: FindManyArgs) {
    return prisma.product.findMany({
      where: buildWhere(args),
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: args.skip,
      take: args.take,
    });
  }

  async count(args: CountArgs) {
    return prisma.product.count({
      where: buildWhere(args),
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: {
        slug,
        deleted: false,
      },
      include: {
        category: true,
      },
    });
  }

  async listCategories() {
    return prisma.category.findMany({
      where: {
        deleted: false,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
        parentId: true,
      },
    });
  }

  async trackProductView(productId: string) {
    await prisma.productInteraction.upsert({
      where: {
        productId,
      },
      update: {
        viewCount: {
          increment: 1,
        },
        lastViewedAt: new Date(),
      },
      create: {
        productId,
        viewCount: 1,
        lastViewedAt: new Date(),
      },
    });
  }
}
