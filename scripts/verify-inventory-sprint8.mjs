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

const service = read("src/modules/inventory/services/inventory.service.ts");
assertIncludes(service, "async findInventoryItemQuickMatch", "Hızlı barkod eşleme service metodu eksik.");
assertIncludes(service, "matchType: \"BARCODE\"", "Barkod eşleme önceliği eksik.");
assertIncludes(service, "matchType: \"SKU\"", "SKU eşleme önceliği eksik.");

const route = read("src/app/api/admin/inventory/quick-lookup/route.ts");
assertIncludes(route, "export async function GET", "Hızlı barkod lookup route'u eksik.");
assertIncludes(route, "findInventoryItemQuickMatch", "Lookup route service katmanını kullanmıyor.");

const manager = read("src/ui/admin/inventory-manager.tsx");
assertIncludes(manager, "quickActionQuery", "Inventory manager hızlı barkod state'i eksik.");
assertIncludes(manager, "submitQuickActionLookup", "Inventory manager hızlı barkod submit akışı eksik.");
assertIncludes(manager, "startQuickActionCamera", "Inventory manager kamera başlatma akışı eksik.");
assertIncludes(manager, "navigator.mediaDevices.getUserMedia", "Inventory manager kamera erişimi eksik.");
assertIncludes(manager, "BarcodeDetector", "Inventory manager barkod algılayıcı progressive enhancement eksik.");
assertIncludes(manager, "quickActionPreferenceKey", "Inventory manager hızlı işlem modu tercihi saklanmıyor.");
assertIncludes(manager, "loadQuickActionMode", "Inventory manager son seçilen hızlı işlem modunu yüklemiyor.");
assertIncludes(manager, "void submitQuickActionLookup(firstValue)", "Kamera barkod okuduktan sonra otomatik açılış akışı eksik.");
assertIncludes(manager, "applyQuickActionDirect", "Inventory manager ultra hızlı uygulama akışı eksik.");
assertIncludes(manager, "quickActionSerialModePreferenceKey", "Inventory manager seri mod tercihi saklanmıyor.");
assertIncludes(manager, "resetQuickActionForNextScan", "Inventory manager sonraki barkoda hazırlık akışı eksik.");
assertIncludes(manager, "quickActionInputRef", "Inventory manager seri modda barkod alanına geri odaklanmıyor.");
assertIncludes(manager, "labels.quickActionFastModeTitle", "Inventory manager ultra hızlı mod paneli eksik.");
assertIncludes(manager, "labels.quickActionTitle", "Inventory manager hızlı barkod panelini göstermiyor.");
assertIncludes(manager, "/api/admin/inventory/quick-lookup?query=", "Inventory manager hızlı lookup API çağrısı eksik.");

const translations = read("src/i18n/tr.json");
assertIncludes(translations, "\"inventoryQuickActionTitle\": \"Hızlı barkod işlemi\"", "Türkçe hızlı barkod başlığı eksik.");
assertIncludes(translations, "\"inventoryQuickActionScannerHint\":", "Türkçe barkod okuyucu ipucu eksik.");
assertIncludes(translations, "\"inventoryQuickActionStartCamera\": \"Kamerayı aç\"", "Türkçe kamera başlat etiketi eksik.");
assertIncludes(translations, "\"inventoryQuickActionRememberedMode\":", "Türkçe hatırlanan mod açıklaması eksik.");
assertIncludes(translations, "\"inventoryQuickActionFastModeTitle\": \"Ultra hızlı uygulama\"", "Türkçe ultra hızlı mod başlığı eksik.");
assertIncludes(translations, "\"inventoryQuickActionSerialMode\":", "Türkçe seri mod etiketi eksik.");

console.log("Sprint 8 inventory doğrulamaları başarıyla geçti.");
