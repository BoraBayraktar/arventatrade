# Inventory External Event Runbook

Bu doküman, harici stok event akışında en sık görülen hata durumları için hızlı operasyon rehberidir.

## Durumlar

### `EXTERNAL_STOCK_MAPPING_NOT_FOUND`

- Anlamı: Gelen event için ürün/depo eşlemesi bulunamadı.
- Kontrol:
  - kanal doğru mu
  - `externalProductId` veya `externalSku` eşleşiyor mu
  - `externalWarehouseCode` beklenen değer mi
- Aksiyon:
  - eksik mapping kaydı oluştur
  - event payload alanlarını kontrol et

### `EXTERNAL_STOCK_MAPPING_READ_ONLY`

- Anlamı: Eşleme bulundu ancak inbound stok yazımına kapalı.
- Kontrol:
  - mapping kaydında `allowInboundUpdates` açık mı
- Aksiyon:
  - sadece gerçekten dış sistemin stok otoritesi olduğu senaryoda aç

### `EXTERNAL_STOCK_TARGET_LEVEL_NOT_FOUND`

- Anlamı: Ürün için eventin uygulanacağı aktif depo seviyesi bulunamadı.
- Kontrol:
  - ürünün inventory aggregate temeli oluşmuş mu
  - hedef depo aktif mi
  - mapping belirli bir depoya bağlıysa o depo mevcut mu
- Aksiyon:
  - ürün/depo temelini oluştur
  - mapping depo bağını düzelt

### `DUPLICATE`

- Anlamı: Aynı `eventKey` daha önce işlendi veya kaydedildi.
- Kontrol:
  - source sistem aynı olayı tekrar mı gönderiyor
  - idempotency anahtarı doğru mu
- Aksiyon:
  - event tekrar oynatılmamalı
  - kaynak entegrasyonda event key üretimini gözden geçir

### `FAILED`

- Anlamı: Event kaydedildi ancak uygulama başarısız oldu.
- Kontrol:
  - son hata mesajı
  - mapping durumu
  - depo/ürün aggregate durumu
- Aksiyon:
  - hatayı gider
  - gerekiyorsa aynı iş kuralıyla yeni event üret

## Operasyonel Okuma Sırası

Bir event incelenirken şu sırayla bakılmalıdır:

1. Ham event doğru mu
   - event key
   - kanal
   - payload özeti
   - harici ürün/depo alanları
2. Mapping nasıl çözüldü
   - `EXTERNAL_PRODUCT_ID` mi
   - `EXTERNAL_SKU` mu
   - eşleme hiç bulunamadı mı
3. Depo nasıl seçildi
   - mapping deposu mu
   - varsayılan depo fallback mi
4. Projection sonucu ne oldu
   - `PENDING`
   - `APPLIED`
   - `FAILED`
   - `DUPLICATE`

Bu okuma sırası sayesinde “event geldi ama neden uygulanmadı?” sorusu daha hızlı cevaplanır.
