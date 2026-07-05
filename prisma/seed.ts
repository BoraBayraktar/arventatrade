import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await hash("Admin123!", 10);
  const editorPasswordHash = await hash("Editor123!", 10);
  const customerPasswordHash = await hash("Customer123!", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@arventatrade.local",
    },
    update: {
      name: "Arventa Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      deleted: false,
      deletedDate: null,
      deletedUserId: null,
    },
    create: {
      email: "admin@arventatrade.local",
      name: "Arventa Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "customer@arventatrade.local",
    },
    update: {
      name: "Arventa Customer",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      deleted: false,
      deletedDate: null,
      deletedUserId: null,
    },
    create: {
      email: "customer@arventatrade.local",
      name: "Arventa Customer",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "editor@arventatrade.local",
    },
    update: {
      name: "Arventa Editor",
      passwordHash: editorPasswordHash,
      role: "EDITOR",
      deleted: false,
      deletedDate: null,
      deletedUserId: null,
    },
    create: {
      email: "editor@arventatrade.local",
      name: "Arventa Editor",
      passwordHash: editorPasswordHash,
      role: "EDITOR",
    },
  });

  const categories = [
    { slug: "elektronik", name: "Elektronik" },
    { slug: "ev-yasam", name: "Ev ve Yasam" },
    { slug: "spor", name: "Spor" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        deleted: false,
        deletedDate: null,
        deletedUserId: null,
      },
      create: category,
    });
  }

  const elektronik = await prisma.category.findUniqueOrThrow({
    where: { slug: "elektronik" },
  });
  const evYasam = await prisma.category.findUniqueOrThrow({
    where: { slug: "ev-yasam" },
  });
  const spor = await prisma.category.findUniqueOrThrow({
    where: { slug: "spor" },
  });

  const subcategories = [
    { slug: "telefon-tablet", name: "Telefon ve Tablet", parentId: elektronik.id },
    { slug: "ses-goruntu", name: "Ses ve Goruntu", parentId: elektronik.id },
    { slug: "mobilya", name: "Mobilya", parentId: evYasam.id },
    { slug: "ev-tekstili", name: "Ev Tekstili", parentId: evYasam.id },
    { slug: "fitness", name: "Fitness", parentId: spor.id },
    { slug: "yoga-pilates", name: "Yoga ve Pilates", parentId: spor.id },
  ];

  for (const category of subcategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        parentId: category.parentId,
        deleted: false,
        deletedDate: null,
        deletedUserId: null,
      },
      create: category,
    });
  }

  const products = [
    {
      slug: "akilli-saat-pro-x2",
      sku: "ASPX2-001",
      name: "Akilli Saat Pro X2",
      description:
        "1.9 in AMOLED ekran, 7 gun pil omru ve gelismis aktivite takibi sunan premium akilli saat.",
      price: "5499.90",
      compareAtPrice: "6299.90",
      stock: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      categoryId: elektronik.id,
    },
    {
      slug: "kablosuz-kulaklik-airpulse",
      sku: "KKAIR-002",
      name: "Kablosuz Kulaklik AirPulse",
      description:
        "Aktif gurultu engelleme, dusuk gecikme modu ve 32 saate kadar pil omru sunan TWS kulaklik.",
      price: "2899.00",
      compareAtPrice: "3399.00",
      stock: 26,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      categoryId: elektronik.id,
    },
    {
      slug: "ergonomik-calisma-koltugu",
      sku: "ECKOLT-003",
      name: "Ergonomik Calisma Koltugu",
      description:
        "Bel destegi ve nefes alan kumas dokusuyla uzun sureli konfor odakli ofis koltugu.",
      price: "7999.00",
      compareAtPrice: null,
      stock: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80",
      categoryId: evYasam.id,
    },
    {
      slug: "yoga-mat-premium",
      sku: "YMPREM-004",
      name: "Yoga Mat Premium",
      description:
        "Kaymaz yuzey, 6 mm destek ve ter tutmayan kaplama ile ev antrenmanlari icin ideal mat.",
      price: "1199.50",
      compareAtPrice: "1499.50",
      stock: 35,
      imageUrl: "/yoga-mat-premium.svg",
      categoryId: spor.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        deleted: false,
        deletedDate: null,
        deletedUserId: null,
      },
      create: {
        ...product,
        currency: "TRY",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
