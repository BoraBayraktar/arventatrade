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
assertIncludes(schema, "model InventoryIntegrationMapping", "InventoryIntegrationMapping modeli bulunamadı.");
assertIncludes(schema, "model ExternalStockEvent", "ExternalStockEvent modeli bulunamadı.");
assertIncludes(schema, "enum ExternalStockEventStatus", "ExternalStockEventStatus enum'u bulunamadı.");

const inventoryService = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(inventoryService, "receiveExternalStockEvent", "Harici stok event işleme servisi bulunamadı.");
assertIncludes(inventoryService, "queueIntegrationSync: false", "Inbound eventlerde dış eşitleme kapatma koruması bulunamadı.");
assertIncludes(inventoryService, "EXTERNAL_STOCK_MAPPING_NOT_FOUND", "Mapping bulunamadığında hata akışı tanımlı değil.");

const mappingRoute = read("src/app/api/admin/inventory/integration-mappings/route.ts");
assertIncludes(mappingRoute, "inventoryService.upsertInventoryIntegrationMapping", "Entegrasyon eşleme route'u eksik.");

const eventRoute = read("src/app/api/admin/inventory/external-events/route.ts");
assertIncludes(eventRoute, "inventoryService.receiveExternalStockEvent", "Harici event route'u eksik.");

console.log("Sprint 2 inventory doğrulamaları başarıyla geçti.");
