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

const schema = read("prisma/schema.prisma");
assertIncludes(schema, "model PurchaseReceipt", "PurchaseReceipt modeli bulunamadı.");
assertIncludes(schema, "model PurchaseReceiptLine", "PurchaseReceiptLine modeli bulunamadı.");

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "tx.purchaseReceipt.create", "Satın alma belgesi oluşturma akışı bulunamadı.");
assertIncludes(repository, "sourceDocumentSupplier", "Belge tedarikçi metadata alanı bulunamadı.");

const route = read("src/app/api/admin/inventory/stock-in/route.ts");
assertIncludes(route, "sourceDocumentNumber", "Stok giriş route'u belge alanlarını almıyor.");
assertIncludes(route, "Bu satın alma belge numarası zaten kullanılıyor.", "Belge numarası çakışma mesajı bulunamadı.");

const ui = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(ui, "Satın alma belgesi", "Drawer üzerinde satın alma belgesi bölümü bulunamadı.");
assertIncludes(ui, "drawerPurchaseDocumentNumber", "Drawer satın alma belge state'i bulunamadı.");

console.log("Sprint 3 inventory doğrulamaları başarıyla geçti.");
