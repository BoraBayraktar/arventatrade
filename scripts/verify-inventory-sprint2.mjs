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

const concurrencyDoc = read("docs/INVENTORY_CONCURRENCY_RULES.md");
assertIncludes(
  concurrencyDoc,
  "Checkout commit: düşüm öncesi güncel `onHand` ve `reserved` doğrulanır, stale ise commit reddedilir.",
  "Concurrency dokümanında checkout commit stale guard matrisi eksik.",
);
assertIncludes(
  concurrencyDoc,
  "Serializable yarış: servis/API katmanında kullanıcıya yenileme ve tekrar deneme mesajı döner.",
  "Concurrency dokümanında serializable yarış dönüş kuralı eksik.",
);

const commerceRepository = read("src/modules/commerce/repositories/commerce.repository.ts");
assertIncludes(
  commerceRepository,
  "const committedLevel = await this.getActiveLevelSnapshot(",
  "Checkout commit öncesi güncel seviye tekrar okunmuyor.",
);
assertIncludes(
  commerceRepository,
  "STALE_RESERVATION_LEVEL:",
  "Checkout stale reservation guard'ı eksik.",
);

const commerceService = read("src/modules/commerce/services/commerce.service.ts");
assertIncludes(
  commerceService,
  "error.message === \"SERIALIZABLE_TRANSACTION_FAILED\"",
  "Commerce service serializable yarış hatasını kullanıcı dostu şekilde ele almıyor.",
);
assertIncludes(
  commerceService,
  "Stok eşzamanlı değiştiği için sepet yeniden doğrulanmalıdır",
  "Commerce service concurrency hata mesajı güncellenmedi.",
);

const stockCountApplyRoute = read("src/app/api/admin/inventory/stock-counts/[id]/apply/route.ts");
assertIncludes(
  stockCountApplyRoute,
  "Sayım uygulanırken eşzamanlı stok değişikliği algılandı. Sayımı yenileyip tekrar deneyin.",
  "Stock count apply route serializable yarış mesajını döndürmüyor.",
);
assertIncludes(
  stockCountApplyRoute,
  "STOCK_COUNT_HAS_ACTIVE_RESERVATIONS:",
  "Stock count apply route aktif rezervasyon çakışma guard'ını işlemiyor.",
);

const inventoryRepository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(
  inventoryRepository,
  "STOCK_COUNT_STALE_LEVEL:",
  "Inventory repository stale sayım guard'ı eksik.",
);
assertIncludes(
  inventoryRepository,
  "STOCK_COUNT_HAS_ACTIVE_RESERVATIONS:",
  "Inventory repository rezervasyon çakışma guard'ı eksik.",
);

console.log("Sprint 2 inventory doğrulamaları başarıyla geçti.");
