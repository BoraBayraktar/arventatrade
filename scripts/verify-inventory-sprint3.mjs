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

const contracts = read("src/modules/inventory/contracts/inventory.contract.ts");
assertIncludes(contracts, "mappingMode:", "External stock event contract mappingMode alanını içermiyor.");
assertIncludes(contracts, "warehouseResolution:", "External stock event contract warehouseResolution alanını içermiyor.");
assertIncludes(contracts, "projectionStatus:", "External stock event contract projectionStatus alanını içermiyor.");
assertIncludes(contracts, "unresolvedCount:", "External stock monitoring unresolvedCount alanını içermiyor.");

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "const mappingMode =", "External stock event mapping çözüm katmanı üretilmiyor.");
assertIncludes(service, "const warehouseResolution =", "External stock event depo çözüm katmanı üretilmiyor.");
assertIncludes(service, "const payloadSummary =", "External stock event payload özeti üretilmiyor.");
assertIncludes(service, "unresolvedCount:", "External stock event monitoring hata sınıflaması eksik.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "Eşleme bulunamadı", "Inventory manager external event hata kırılım kartlarını göstermiyor.");
assertIncludes(manager, "Payload özeti:", "Inventory manager external event payload özetini göstermiyor.");
assertIncludes(manager, "Projection sonucu:", "Inventory manager external event projection sonucunu göstermiyor.");

const flowDoc = read("docs/INVENTORY_EXTERNAL_STOCK_FLOW.md");
assertIncludes(flowDoc, "Kurumsal Katmanlar", "External stock flow dokümanında kurumsal katmanlar bölümü eksik.");
assertIncludes(flowDoc, "Ham event:", "External stock flow dokümanı ham event katmanını açıklamıyor.");

const runbook = read("docs/INVENTORY_EXTERNAL_EVENT_RUNBOOK.md");
assertIncludes(runbook, "Operasyonel Okuma Sırası", "External event runbook operasyonel okuma sırasını içermiyor.");
assertIncludes(runbook, "Projection sonucu ne oldu", "External event runbook projection okuma sırasını içermiyor.");

console.log("Sprint 3 inventory doğrulamaları başarıyla geçti.");
