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

const repository = read("src/modules/inventory/repositories/inventory.repository.ts");
assertIncludes(repository, "async listInventoryOverviewMovements", "Overview hareketleri için ayrı repository sorgusu eksik.");
assertIncludes(repository, "inventoryItemId: true", "Overview hareket sorgusu inventoryItemId alanını taşımıyor.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "\"inventory:overview:v4\"", "Overview cache sürümü güncellenmemiş.");
assertIncludes(service, "buildInventoryOverviewItems", "Overview iki aşamalı eşleme helper'ı eksik.");
assertIncludes(service, "movementRelevantProductIds", "Sayfa bazlı movement yükleme optimizasyonu eksik.");
assertIncludes(service, "movementsByInventoryItemId", "Overview hareketleri inventory item bazlı gruplanmıyor.");
assertIncludes(service, "productsForDecoration", "Overview dekorasyon için ikinci aşama ürün seçimi eksik.");

console.log("Sprint 9 inventory doğrulamaları başarıyla geçti.");
