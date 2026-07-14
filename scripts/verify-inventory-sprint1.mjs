import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(content, expected, message) {
  if (!content.includes(expected)) {
    throw new Error(message);
  }
}

const authorityDoc = read("docs/INVENTORY_STOCK_AUTHORITY.md");
assertIncludes(
  authorityDoc,
  "`Inventory aggregate = tek stok doğrusu`",
  "Stok otoritesi dokümanında resmi aggregate kuralı bulunamadı.",
);
assertIncludes(
  authorityDoc,
  "`Product.stock = legacy summary`",
  "Stok otoritesi dokümanında legacy summary kuralı bulunamadı.",
);
assertIncludes(
  authorityDoc,
  "Fallback gerekiyorsa kod içinde açıkça `legacy summary fallback` niyetiyle isimlendirilmelidir.",
  "Legacy summary fallback isimlendirme kuralı dokümana işlenmedi.",
);
assertIncludes(
  authorityDoc,
  "Commerce sipariş uygunluğu: inventory aggregate otoritesi",
  "Sprint 1 uygulama matrisi dokümanda eksik.",
);

const legacyAuditDoc = read("docs/INVENTORY_LEGACY_STOCK_AUDIT.md");
assertIncludes(
  legacyAuditDoc,
  "Kod içinde açıkça isimlendirilmiş `legacy summary fallback` kullanımları",
  "Legacy stock audit dokümanında isimlendirilmiş fallback kuralı eksik.",
);

const inventoryRepository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(
  inventoryRepository,
  "STOCK_COUNT_STALE_LEVEL:",
  "Sayım için stale level koruması bulunamadı.",
);
assertIncludes(
  inventoryRepository,
  "STOCK_COUNT_HAS_ACTIVE_RESERVATIONS:",
  "Sayım için aktif rezervasyon koruması bulunamadı.",
);

const applyRoute = read("src/app/api/admin/inventory/stock-counts/[id]/apply/route.ts");
assertIncludes(
  applyRoute,
  "Sayım satırları güncel stokla uyuşmuyor",
  "API route içinde stale level Türkçe hata mesajı bulunamadı.",
);
assertIncludes(
  applyRoute,
  "Bu depoda aktif rezervasyon bulunduğu için sayım uygulanamadı",
  "API route içinde aktif rezervasyon Türkçe hata mesajı bulunamadı.",
);

const catalogService = read("src/modules/catalog/services/catalog.service.ts");
assertIncludes(
  catalogService,
  "legacy summary fallback",
  "Catalog service aggregate olmayan durumda legacy summary fallback niyetini açıkça belirtmiyor.",
);

const catalogAdminService = read("src/modules/catalog/services/catalog-admin.service.ts");
assertIncludes(
  catalogAdminService,
  "legacy summary fallback",
  "Catalog admin service aggregate olmayan durumda legacy summary fallback niyetini açıkça belirtmiyor.",
);

const inventoryService = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(
  inventoryService,
  "resolveAggregateAvailabilityFromLevels",
  "Inventory service aggregate/fallback çözümleyicisini merkezileştirmedi.",
);
assertIncludes(
  inventoryService,
  "legacy summary fallback",
  "Inventory service fallback niyetini açıkça belirtmiyor.",
);

const commerceRepository = read("src/modules/commerce/repositories/commerce.repository.ts");
assertIncludes(
  commerceRepository,
  "Product.stock sipariş otoritesi değildir; sadece aggregate yoksa legacy summary fallback'tir.",
  "Commerce repository sipariş fallback kuralını açıkça belgelemiyor.",
);

console.log("Sprint 1 inventory doğrulamaları başarıyla geçti.");
