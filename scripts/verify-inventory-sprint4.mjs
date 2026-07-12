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
assertIncludes(schema, "sourceDocumentType String?", "InventoryTransaction belge tipi alanı bulunamadı.");
assertIncludes(schema, "sourceDocumentDate DateTime?", "InventoryTransaction belge tarihi alanı bulunamadı.");
assertIncludes(schema, "externalReference String?", "InventoryTransaction dış referans alanı bulunamadı.");
assertIncludes(schema, "counterpartyName  String?", "InventoryTransaction taraf alanı bulunamadı.");

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "sourceDocumentType: args.sourceDocumentType ?? null", "Repository transaction belge alanlarını yazmıyor.");
assertIncludes(repository, "purchaseReceipt:", "Repository transaction sorgusunda purchaseReceipt include eksik.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "sourceDocumentDate: Date | null", "Service transaction belge tarihi eşlemesini yapmıyor.");
assertIncludes(service, "externalReference: item.purchaseReceipt?.externalReference ?? item.externalReference", "Service dış referans merkezileştirmesi eksik.");

const ui = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(ui, "formatSourceDocumentMeta", "UI belge meta formatlayıcısı eksik.");
assertIncludes(ui, "Harici ref:", "UI dış referans gösterimi eksik.");

console.log("Sprint 4 inventory doğrulamaları başarıyla geçti.");
