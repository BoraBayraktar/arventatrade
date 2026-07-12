# 2BEM Development Rules

Bu dosya ArventaTrade gelistirme standardi icin tek kaynak (single source of truth) olarak kullanilir.
Tum yeni gelistirmeler ve refactor islemleri bu kurallara uygun yapilmalidir.

## 1) Modular Monolith ve Katman Sinirlari

- UI katmani Prisma veya repository katmanina dogrudan erisemez.
- Her modul Contract -> Repository -> Service akisiyla tasarlanir.
- Moduller birbiriyle yalnizca service katmani uzerinden haberlesir.
- API adapter veya UI katmaninda is kurali yazma; is kurali service katmaninda olur.

## 2) i18n Kurallari

- Lokalizasyon altyapisi i18n uzerinden yonetilir.
- Key kaynaklari sadece iki dosyadir:
  - src/i18n/tr.json
  - src/i18n/en.json
- i18n alt yapısını koru kaldırma ama bundan sonra aksi belirtilene kadar sadece Türkçe dil kullanılacak. 

## 3) Responsive UI Kurallari

- Tum ekranlar mobile-first yaklasimla gelistirilir.
- UI tam mobil uyumlu ve responsive olmalidir.
- Kritik sayfalar (liste, detay, form) mobil/tablet/desktop viewportlarinda kontrol edilmelidir.

## 4) API ve Service Layer Zorunlulugu

- Tum API route'lari service layer uzerinden calisir.
- API route katmani Prisma veya DB'ye dogrudan erisemez.
- API route, yalnizca request parsing + response mapping gorevi gorur.

## 5) Redis Merkezi Cache

- Cache katmani merkezi Redis (distributed cache) ile kurulur.
- Read agirlikli endpointlerde TTL bazli cache stratejisi uygulanir.
- Yazma operasyonlarinda ilgili key invalidation kurallari tanimlanir.

## Uygulama Notu

- Kod incelemesi, lint ve mimari kontroller bu dosyaya gore yapilir.
- Bu dosyayla celisen bir degisiklik kabul edilmez.
