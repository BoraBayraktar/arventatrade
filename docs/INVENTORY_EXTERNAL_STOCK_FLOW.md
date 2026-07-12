# Inventory External Stock Flow

Bu doküman, harici sistemlerden gelen stok eventlerinin 2BEM içinde nasıl işlendiğini tanımlar.

## Akış Özeti

1. Harici event önce `ExternalStockEvent` olarak idempotent biçimde kaydedilir.
2. Event, `InventoryIntegrationMapping` üzerinden ürün ve depo ile eşleştirilir.
3. Eşleme inbound yazıma açıksa inventory aggregate güncellenir.
4. Sonuç alanları `appliedOnHand` ve `appliedAvailable` olarak projection kaydına yazılır.
5. Başarısızlık varsa event `FAILED` durumuna alınır ve hata mesajı saklanır.

## Mapping Kuralları

- Mapping çözümü sırası:
  - `channel + externalProductId + externalWarehouseCode`
  - `channel + externalSku + externalWarehouseCode`
- Depo eşleşmesi yoksa aktif varsayılan depo fallback olarak seçilebilir.
- `allowInboundUpdates = false` olan kayıtlar salt okunur kabul edilir.

## Projection Kuralları

- `ExternalStockEvent` kaydı denetim izi ve operasyonel gözlem amacıyla korunur.
- Projection kaydında şu bilgiler anlamlı kabul edilir:
  - event kaynağı
  - event anahtarı
  - harici ürün/depo tanımları
  - çözümlenen ürün/depo
  - uygulanan on-hand ve available sonuçları
  - hata mesajı ve işlenme zamanı

## Otorite Kuralı

- Harici event hiçbir zaman `Product.stock` alanına doğrudan yazmaz.
- Event yalnızca inventory aggregate üstünden uygulanır.
- `Product.stock` ancak aggregate güncellemesinden sonra legacy summary olarak senkronize edilir.
