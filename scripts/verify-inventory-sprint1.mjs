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

console.log("Sprint 1 inventory doğrulamaları başarıyla geçti.");
