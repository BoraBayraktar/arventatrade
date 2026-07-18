import { HepsiburadaClient, type HepsiburadaProductUpdateItem } from "@/modules/integration/connectors/hepsiburada.client";
import { MarketplaceIntegrationRepository } from "@/modules/integration/repositories/marketplace-integration.repository";
import { integrationSecretCryptoService } from "@/modules/integration/services/integration-secret-crypto.service";

function decimalToNumber(value: { toNumber?: () => number; toString: () => string } | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value.toString());
}

function readTrackingId(payload: Record<string, unknown>) {
  const data = payload.data;
  if (typeof data === "object" && data !== null) {
    const trackingId = (data as Record<string, unknown>).trackingId;
    if (typeof trackingId === "string" && trackingId.trim().length > 0) {
      return trackingId.trim();
    }
  }

  const trackingId = payload.trackingId;
  return typeof trackingId === "string" && trackingId.trim().length > 0 ? trackingId.trim() : null;
}

function resolveImages(target: NonNullable<Awaited<ReturnType<MarketplaceIntegrationRepository["findProductSyncPreflightTarget"]>>>) {
  return [target.imageUrl, ...target.imageUrls]
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, 10);
}

function buildImageFields(images: string[]) {
  return Object.fromEntries(images.map((image, index) => [`image${index + 1}`, image])) as Partial<HepsiburadaProductUpdateItem>;
}

export class HepsiburadaProductSyncService {
  constructor(private readonly repository = new MarketplaceIntegrationRepository()) {}

  async preflightProduct(productId: string) {
    const [target, config] = await Promise.all([
      this.repository.findProductSyncPreflightTarget(productId),
      this.repository.listActiveConfigsByChannel("HEPSIBURADA").then((items) => items[0] ?? null),
    ]);

    if (!target) {
      throw new Error("HEPSIBURADA_PRODUCT_SYNC_PRODUCT_NOT_FOUND");
    }

    const blockingIssues: string[] = [];
    const warnings: string[] = [];
    const hbSku = target.sku.trim();
    const images = resolveImages(target);

    if (!config) {
      blockingIssues.push("Aktif Hepsiburada entegrasyon konfigürasyonu bulunmalıdır.");
    }

    if (!hbSku) {
      blockingIssues.push("Hepsiburada ürün güncellemesi için hbSku gereklidir. İlk fazda ürün SKU alanı hbSku olarak kullanılır.");
    }

    if (!target.name.trim()) {
      blockingIssues.push("Ürün adı zorunludur.");
    }

    if (!target.description.trim()) {
      blockingIssues.push("Ürün açıklaması zorunludur.");
    }

    if (target.description.trim().length < 80) {
      warnings.push("Ürün açıklaması kısa görünüyor. Hepsiburada içerik kalitesi için daha açıklayıcı metin önerilir.");
    }

    if (!target.barcode?.trim()) {
      warnings.push("Barkod boş. Hepsiburada ürün güncellemesinde barkod alanı gönderilmeyecek.");
    }

    if (images.length === 0) {
      warnings.push("Ürün görseli bulunmuyor. Görsel alanları gönderilmeyecek.");
    }

    if (target.status !== "ACTIVE" || !target.salesEnabled) {
      warnings.push("Ürün aktif veya satışa açık değil; ürün bilgisi güncellenebilir ama satış operasyonunda ayrıca stok/fiyat sıfırlanabilir.");
    }

    const draftItem: HepsiburadaProductUpdateItem = {
      hbSku,
      productName: target.name.trim(),
      productDescription: target.description.trim(),
      ...(target.barcode?.trim() ? { barcode: target.barcode.trim() } : {}),
      kdv: String(target.vatRate),
      ...buildImageFields(images),
    };

    return {
      productId: target.id,
      hbSku,
      sku: target.sku,
      barcode: target.barcode,
      status: target.status,
      salesEnabled: target.salesEnabled,
      price: decimalToNumber(target.price),
      descriptionLength: target.description.length,
      imageCount: images.length,
      blockingIssues,
      warnings,
      readyForHepsiburadaProductUpdate: blockingIssues.length === 0,
      draftPayload: blockingIssues.length === 0
        ? {
            merchantId: config?.sellerId ?? null,
            items: [draftItem],
          }
        : null,
    };
  }

  async syncProduct(productId: string) {
    const preflight = await this.preflightProduct(productId);

    if (!preflight.readyForHepsiburadaProductUpdate || !preflight.draftPayload) {
      throw new Error(`HEPSIBURADA_PRODUCT_SYNC_PREFLIGHT_FAILED:${preflight.blockingIssues.join(" | ")}`);
    }

    const [config] = await this.repository.listActiveConfigsByChannel("HEPSIBURADA");

    if (!config) {
      throw new Error("HEPSIBURADA_CONFIG_NOT_FOUND");
    }

    const apiKey = integrationSecretCryptoService.decrypt(config.apiKeyEncrypted);
    const apiSecret = integrationSecretCryptoService.decrypt(config.apiSecretEncrypted);
    const serviceToken = integrationSecretCryptoService.decrypt(config.serviceTokenEncrypted);

    if (!apiKey || !apiSecret || !config.userAgent) {
      throw new Error("HEPSIBURADA_CONFIG_INCOMPLETE");
    }

    const client = new HepsiburadaClient({
      merchantId: config.sellerId,
      apiKey,
      apiSecret,
      userAgent: config.userAgent,
      endpointUrl: config.endpointUrl,
    });
    const result = await client.importProductUpdates({
      serviceToken: serviceToken ?? apiSecret,
      items: preflight.draftPayload.items,
    });
    const trackingId = readTrackingId(result);

    return {
      providerKey: "hepsiburada",
      externalReference: trackingId ?? preflight.hbSku,
      responsePayload: {
        ...result,
        trackingId,
        preflight,
        hbSku: preflight.hbSku,
      },
    };
  }
}

export const hepsiburadaProductSyncService = new HepsiburadaProductSyncService();
