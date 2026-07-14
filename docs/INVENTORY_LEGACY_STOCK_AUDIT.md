# Inventory Legacy Stock Audit

Bu doküman, `Product.stock` alanının nerelerde kullanılmasının kabul edilebilir olduğunu özetler.

## Resmi Kural

- `Product.stock` gerçek stok otoritesi değildir.
- Resmi stok kararı yalnızca inventory aggregate üzerinden verilir.
- `Product.stock` sadece özet, fallback ve geçiş dönemi uyumluluğu için tutulur.

## İzinli Kullanımlar

- Aggregate henüz oluşmamış ürünlerde kontrollü başlangıç/fallback
- Storefront ve katalog görünümünde özet stok göstergesi
- Geçiş dönemi tutarlılık raporları
- Summary senkronizasyonu
- Kod içinde açıkça isimlendirilmiş `legacy summary fallback` kullanımları

## Storefront Kararı

- Storefront ürün kartlarında ve liste yüzeylerinde kullanıcıya gösterilen stok bilgisi aggregate hesapla üretilmelidir.
- `Product.stock` storefront için yalnızca aggregate henüz oluşmamış ürünlerde fallback olarak kabul edilir.
- Sepete ekleme ve stokta var/yok kararı aggregate kullanılabilir stok üstünden verilmelidir.

## Yasak Kullanımlar

- Sipariş uygunluk kararını yalnızca `Product.stock` ile vermek
- Rezervasyon veya sayım çakışma kontrolünü `Product.stock` ile yapmak
- Depo bazlı stok kararlarını `Product.stock` ile üretmek
- Yeni repository veya service akışlarında aggregate yerine `Product.stock` merkezli yazma yapmak

## Sprint 10 Notu

Sprint 10 itibarıyla inventory ve commerce yazma akışlarında `Product.stock` doğrudan otorite olarak kullanılmamalıdır.
Kalan kullanımlar belge/fallback/summary niteliğinde kalmalıdır.

## Sprint 1 Tamamlama Notu

Sprint 1 sonunda aşağıdaki yüzeyler kontrollü kabul edilir:

- `catalog.service`: aggregate varsa onu, yoksa legacy summary fallback
- `catalog-admin.service`: aggregate varsa onu, yoksa legacy summary fallback
- `inventory.service#getProductAvailability`: aggregate varsa onu, yoksa legacy summary fallback
- `commerce.repository`: aggregate bootstrap dışında sipariş otoritesi olarak legacy summary kullanmaz
