# Inventory Concurrency Rules

Bu doküman, sipariş, rezervasyon, manuel hareket ve sayım akışlarının aynı anda çalıştığı durumlarda uygulanan korumaları özetler.

## Temel Kural

- Kritik stok yazma akışları serializable transaction içinde çalışır.
- Serializable yarış tekrarları `P2034` durumunda kontrollü olarak yeniden denenir.

## Sipariş ve Rezervasyon

- Sipariş öncesi uygunluk kontrolü inventory aggregate üstünden yapılır.
- Rezervasyon hold adımında güncel depo seviyesi tekrar okunur.
- Güncel kullanılabilir stok istenen miktardan küçükse rezervasyon reddedilir.
- Commit adımında:
  - rezervasyon kaydı hâlâ `ACTIVE` olmalıdır
  - ilgili depo seviyesinde yeterli `onHand` ve `reserved` miktarı bulunmalıdır
  - aksi halde işlem stale kabul edilip iptal edilir

## Sayım Uygulama

- Sayım satırındaki `systemOnHand` ile güncel `InventoryLevel.onHand` aynı değilse uygulama reddedilir.
- İlgili seviyede aktif rezervasyon varken sayım uygulanmaz.

## Restock ve İade

- Aynı rezervasyon için ikinci kez restock hareketi üretilmez.
- Restock yalnızca `COMMITTED` durumundaki rezervasyonlar için yapılır.

## Legacy Summary Kuralı

- `Product.stock` eşzamanlılık kararı veren kaynak değildir.
- Tüm guard’lar inventory aggregate üstünden çalışır.
