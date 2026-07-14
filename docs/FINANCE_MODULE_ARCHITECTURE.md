# Finans Modulu Mimari Tasarimi

Bu dokuman, mevcut ArventaTrade yapisinda finans modulu ailesinin nasil tasarlanacagini tanimlar.

Amac:

- mevcut `products`, `inventory`, `orders`, `documents` omurgasiyla entegre calisan
- ancak ekran ve route sinirlari net olan
- UI tarafinda bilgi yogunlugu kontrollu kalan
- `DEVELOPMENT_RULES.md` ile uyumlu

bir finans yapisini uygulamaya hazir hale getirmektir.

## Tasarim Ilkeleri

Bu alan icin temel kurallar:

- finans modulu tek bir buyuk ekran olarak tasarlanmaz
- her ana is alani kendi route'u uzerinde calisir
- moduller arasi veri birlestirme service katmaninda yapilir, UI katmaninda yapilmaz
- bir sayfa baska bir modulu kendi icinde yeniden kurmaz
- detay ihtiyaci link, drawer veya detay sayfasi ile acilir; varsayilan ekran sade kalir
- `ozet -> liste -> detay` akisi ana desen olarak kullanilir
- teknik detaylar varsayilan yuzeyde degil, ikinci katmanda sunulur

## Hedef Modul Ailesi

Finans alani tek modul adi altinda birden fazla alt alan olarak ele alinir:

### 1. `finance/payables`

Amac:

- tedarikci borclarini takip etmek
- satin alma belgesi, e-fatura ve irsaliye baglantilarini tek borc gorunumunde toplamak

Kapsam:

- acik borc ozeti
- vade bazli borc listesi
- belge bazli borc kayitlari
- tedarikci detayina gecis

### 2. `finance/receivables`

Amac:

- musteri alacaklarini takip etmek
- siparis, belge ve odeme durumu baglamini tek alacak gorunumune cevirmek

Kapsam:

- acik alacak ozeti
- gecikmis alacaklar
- siparis veya belge bazli acik bakiye
- musteri detayina gecis

### 3. `finance/accounts`

Amac:

- cari hareketleri standart bir ekstre yapisinda gostermek

Kapsam:

- borc/alacak hareket satirlari
- belge, tahsilat, odeme ve iade baglantilari
- bakiye akisi

Not:

- bu alan tek basina ana dashboard olmaz
- musteri ve tedarikci detay ekranlarinin ana veri kaynagi olur

### 4. `finance/collections`

Amac:

- tahsilat kayitlarini yonetmek

Kapsam:

- tahsilat olusturma
- alacak kaydi ile eslestirme
- musteri bazli tahsilat listesi
- durum takibi

### 5. `finance/payments`

Amac:

- tedarikci odemelerini yonetmek

Kapsam:

- odeme kaydi olusturma
- borc kaydi ile eslestirme
- tedarikci bazli odeme listesi
- durum takibi

### 6. `finance/reports`

Amac:

- operasyonel karar destegi sunmak

Kapsam:

- alacak yaslandirma
- borc yaslandirma
- tahsilat performansi
- odeme performansi
- stok degerleme finans gorunumu
- nakit akis ozetleri

## Diger Modullerle Entegrasyon Sinirlari

### `catalog` ile entegrasyon

Finans modulunun `catalog` tarafindan kullanacagi alanlar:

- urun satis fiyati
- alis fiyati
- KDV orani
- birincil tedarikci iliskisi
- urunun satisa veya alisa acik olma durumu

Kurallar:

- finans ekrani urun yonetim formunu kendi icinde gommez
- urun kartina ait alanlar finans icinde sadece referans veri olarak kullanilir
- urun detay ihtiyaci varsa `products` route'una link verilir

### `inventory` ile entegrasyon

Finans modulunun `inventory` tarafindan kullanacagi alanlar:

- stok giris ve cikis hareketleri
- purchase receipt baglantisi
- maliyet gorunumu
- stok degerleme ozeti
- kaynak belge ve karsi taraf bilgisi

Kurallar:

- finans sayfasinda tam stok operasyon arayuzu acilmaz
- stok hareket gecmisi finans icinde tam tablo olarak yeniden kurulmaz
- finans tarafi stok bilgisini ozet veya referans link olarak kullanir

### `commerce` ile entegrasyon

Finans modulunun `commerce` tarafindan kullanacagi alanlar:

- siparis toplamlari
- odeme durumu
- refund etkisi
- siparis tarihi ve musteri baglanti bilgisi

Kurallar:

- finans ekraninda siparis operasyon detaylari ana icerik olmaz
- siparis satir detaylari ancak ilgili kayit detayinda acilir
- siparisin asıl yonetimi `orders` modulunde kalir

### `documents` ile entegrasyon

Finans modulunun `documents` tarafindan kullanacagi alanlar:

- belge tipi
- belge numarasi
- issue date
- karsi taraf bilgisi
- toplam tutar
- siparis ve stok islem baglantisi
- e-fatura ve e-irsaliye durumu

Kurallar:

- finans tarafinda belge formu kopyalanmaz
- belge dispatch ve provider operasyonlari `documents` alaninda kalir
- finans ekrani belgeyi borc/alacak kaydinin kaynagi olarak kullanir

## Route Tasarimi

Ana route yapisi:

- `/admin/finance`
- `/admin/finance/payables`
- `/admin/finance/receivables`
- `/admin/finance/accounts`
- `/admin/finance/collections`
- `/admin/finance/payments`
- `/admin/finance/reports`

Detay route yapisi:

- `/admin/finance/suppliers/[id]`
- `/admin/finance/customers/[id]`
- `/admin/finance/accounts/[id]`
- `/admin/finance/collections/[id]`
- `/admin/finance/payments/[id]`
- `/admin/finance/reports/aging`
- `/admin/finance/reports/cashflow`
- `/admin/finance/reports/stock-value`

Yardimci operasyon route'lari:

- `/admin/finance/payables/[id]`
- `/admin/finance/receivables/[id]`

Not:

- ilk fazda detay route'lari drawer yerine sayfa olarak kurgulanmalidir
- boylece bilgi ic ice gecmez ve ekran karmasasi azalir

## Sayfa Yogunlugu Kurallari

Tum finans sayfalari su ortak UX kuralina uyar:

### Varsayilan ust alan

- sayfa basligi
- kisa aciklama
- 3 ila 5 KPI karti
- sade filtreler

### Ana icerik

- tek amaca hizmet eden liste veya ozet tablo
- liste satirinda yalnizca karar icin gerekli alanlar

### Ikinci katman

- satir detayina git
- ilgili belgeyi ac
- ilgili siparisi ac
- ilgili stok islemini ac
- ilgili cari ekstreyi ac

Sunlar ayni ekranda biriktirilmez:

- tam belge formu
- tam siparis detayi
- tam stok hareket operasyonu
- cari ekstre ve tahsilat formu ayni yuzeyde
- rapor ve islem listesi ayni ana blokta

## Hedef Sayfa Davranislari

### `/admin/finance/payables`

Varsayilan alanlar:

- toplam acik borc
- vadesi gecen borc
- bu ay gelen belge adedi
- taslak belge riski

Liste alanlari:

- tedarikci
- belge sayisi
- acik tutar
- para birimi
- son belge tarihi
- yakin vade bilgisi

Satir aksiyonlari:

- borc detayi
- tedarikci ekstresi
- ilgili belgeler

### `/admin/finance/receivables`

Varsayilan alanlar:

- toplam acik alacak
- vadesi gecen alacak
- tahsilat bekleyen siparis sayisi
- iade etkisi olan kayit sayisi

Liste alanlari:

- musteri
- siparis veya belge adedi
- acik bakiye
- odeme durumu ozeti
- son islem tarihi

Satir aksiyonlari:

- alacak detayi
- musteri ekstresi
- ilgili siparisler

### `/admin/finance/accounts/[id]`

Bu ekran yalnizca tek cari icin calisir.

Bolumler:

- cari ozet karti
- bakiye kartlari
- hareket listesi
- filtreler

Hareket tipleri:

- belge
- tahsilat
- odeme
- iade
- manuel duzeltme

### `/admin/finance/reports/stock-value`

Amac:

- stok modulu icindeki degerleme verisini finans diline cevirmek

Kapsam:

- toplam stok degeri
- depo bazli stok degeri
- kategori bazli stok degeri
- maliyet yontemi etkisi

Kurallar:

- bu ekran stok operasyon sayfasi degildir
- sayim, transfer veya manuel stok aksiyonu bu ekranda acilmaz

## Service Katmani Tasarimi

Onerilen dosya yapisi:

- `src/modules/finance/contracts/finance-overview.contract.ts`
- `src/modules/finance/contracts/payables.contract.ts`
- `src/modules/finance/contracts/receivables.contract.ts`
- `src/modules/finance/contracts/accounts.contract.ts`
- `src/modules/finance/contracts/collections.contract.ts`
- `src/modules/finance/contracts/payments.contract.ts`
- `src/modules/finance/contracts/reports.contract.ts`

- `src/modules/finance/services/finance-overview.service.ts`
- `src/modules/finance/services/payables.service.ts`
- `src/modules/finance/services/receivables.service.ts`
- `src/modules/finance/services/accounts.service.ts`
- `src/modules/finance/services/collections.service.ts`
- `src/modules/finance/services/payments.service.ts`
- `src/modules/finance/services/reports.service.ts`

- `src/modules/finance/repositories/finance.repository.ts`

Repository kurallari:

- finans repository yalnizca kendi sorgu ihtiyaclari icin kullanilir
- diger modullerin repository'lerine UI veya API katmani ulasmaz
- moduller arasi is mantigi service seviyesinde birlestirilir

## Veri Modeli Yol Haritasi

Ilk asamada mevcut veriyle cikarilabilecek yapilar:

- supplier payables
- customer receivables
- order linked receivable summary
- inventory linked payable summary
- document linked account movement preview

Ikinci asamada eklenmesi muhtemel tablolar:

- `FinanceAccount`
- `FinanceAccountEntry`
- `CollectionRecord`
- `PaymentRecord`
- `AllocationLink`

Bu yeni tablolar eklenirse kurallar:

- musteri ve tedarikci kimligi mevcut domain modelleriyle iliskilenir
- belge veya siparis kaynagi nullable referans alanlariyla baglanir
- manuel hareketler acikca isaretlenir
- audit ve izlenebilirlik zorunlu tutulur

## Admin Route Backlog

### Faz 1

Hedef:

- mevcut `payables` ekranini mimari referans haline getirmek
- finans ana route haritasini acmak

Isler:

1. `/admin/finance` overview route tasarla
2. `/admin/finance/payables` ekranini KPI + liste + detay akisina sabitle
3. finance menu altinda gelecekteki route'lar icin bilgi mimarisi kur

### Faz 2

Hedef:

- musteri alacaklari omurgasini kurmak

Isler:

1. `receivables.contract.ts`
2. `receivables.service.ts`
3. `/admin/finance/receivables`
4. musteri bazli acik bakiye gorunumu

### Faz 3

Hedef:

- cari ekstre deneyimini ayri route olarak sunmak

Isler:

1. `/admin/finance/customers/[id]`
2. `/admin/finance/suppliers/[id]`
3. `/admin/finance/accounts/[id]`
4. hareket tipleri ve kaynak baglantilarini standardize etmek

### Faz 4

Hedef:

- tahsilat ve odeme hareketlerini sisteme almak

Isler:

1. `collections` modulu
2. `payments` modulu
3. acik kayitlarla eslestirme akisi
4. hareket detay ekranlari

### Faz 5

Hedef:

- karar destek raporlarini ayrik route'larda acmak

Isler:

1. aging report
2. cashflow report
3. stock-value report
4. tahsilat/odeme performans kartlari

## Uygulama Sirasinda Kacinilacaklar

- tek sayfada urun, stok, siparis, belge ve cari detayini bir araya toplamak
- UI katmaninda farkli modullerin verisini dogrudan birlestirmek
- finans ekranlarinda stok operasyon formu veya belge dispatch operasyonu acmak
- tum finans alanini tek route altinda sekmelerle asiri yogunlastirmak
- drawer icinde ikinci drawer veya ucuncu detay katmani olusturmak

## Karar Ozeti

Bu repo icin uygun hedef su sekildedir:

- finans, diger modullerle entegre ama onlardan bagimsiz route sinirlari olan bir modul ailesi olarak gelistirilir
- `payables`, `receivables`, `accounts`, `collections`, `payments`, `reports` ayri sorumluluk alanlari olarak ele alinir
- varsayilan ekranlar sade tutulur
- detaylar link veya ayri route ile acilir
- service katmani entegrasyon merkezi olur

Bu tasarim, mevcut modular monolith yapisina ve `DEVELOPMENT_RULES.md` icindeki katman kurallarina uygundur.
