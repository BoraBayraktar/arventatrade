# GİB/Kurumsal Audit Hardening Runbook

Bu runbook 2BEM audit kanıt zincirinin üretilmesi, doğrulanması, saklanması ve denetçiye ibrazı için uygulanır.

## Kapsam

- `AuditLog` kayıtları append-only kabul edilir.
- `BusinessDocumentLifecycleEvent` e-belge yaşam döngüsü kanıtıdır.
- `BusinessDocumentIntegrationMessage` entegrasyon mesaj kanıtıdır.
- `AuditAnchor` dönemsel hash sabitleme kaydıdır.

## Saklama Politikası

- Audit kayıtları ve e-belge kanıtları en az 10 yıl saklanacak şekilde planlanır.
- WORM/Object Lock destekli storage kullanımı önerilir.
- Local fallback yalnızca geliştirme ve acil durum içindir; üretimde `AUDIT_WORM_BUCKET` tanımlanmalıdır.

## Günlük Anchor Üretimi

1. Önce zincir doğrulaması çalıştırılır:

```bash
npm run verify:audit:integrity
```

2. Admin API üzerinden anchor oluşturulur:

```http
POST /api/admin/audit-logs/anchors
Content-Type: application/json

{
  "startDate": "2026-07-21",
  "endDate": "2026-07-21"
}
```

3. Oluşan `manifestHash`, `storageMode`, `storageObjectKey` ve kayıt sayısı saklanır.

## Denetçi Manifesti

Audit ekranındaki `Denetçi manifesti indir` aksiyonu veya aşağıdaki endpoint kullanılır:

```http
GET /api/admin/audit-logs?export=manifest&startDate=2026-07-21&endDate=2026-07-21&pageSize=100
```

Manifest içinde:

- `manifestHash`
- `firstChainHash`
- `lastChainHash`
- kayıt bazlı `payloadHash`, `previousHash`, `chainHash`
- filtre bilgisi

bulunur.

## E-Belge Kanıt Paketi

Belge bazlı kanıt paketi:

```http
GET /api/admin/documents/{id}/evidence-package
```

Paket içinde belge özeti, dispatch kayıtları, lifecycle eventleri, entegrasyon mesaj hashleri ve `packageHash` bulunur.

## Bütünlük Doğrulama

```bash
npm run verify:audit:integrity
```

Hata varsa:

- Üretim sisteminde kayıtlar değiştirilmiş olabilir.
- İlgili tarih aralığının WORM anchor manifesti ile karşılaştırılması gerekir.
- Düzeltme yapılmaz; yeni correction event ve olay raporu oluşturulur.

## Audit Coverage Kontrolü

```bash
npm run verify:audit:coverage
```

Her write endpoint audit üretmeli veya açık `AUDIT_EXEMPT_REASON` taşımalıdır.

## Hassas Veri Standardı

- Şifre, token, secret, authorization, signature, api key alanları maskelenir.
- Ham gizli değerler audit metadata veya entegrasyon mesaj payload içinde saklanmaz.
- Gerekiyorsa sadece hash veya masked değer tutulur.

## Üretim Ortam Değişkenleri

- `AUDIT_WORM_ENDPOINT`
- `AUDIT_WORM_PORT`
- `AUDIT_WORM_USE_SSL`
- `AUDIT_WORM_ACCESS_KEY`
- `AUDIT_WORM_SECRET_KEY`
- `AUDIT_WORM_BUCKET`
- `AUDIT_WORM_PUBLIC_BASE_URL`
- `AUDIT_EVIDENCE_LOCAL_DIR`

## Denetçi Talebi Yanıtlama

1. İstenen tarih aralığı belirlenir.
2. Audit manifest export alınır.
3. İlgili e-belgeler için evidence package alınır.
4. Aynı tarih aralığı için `AuditAnchor` ve WORM manifest bilgisi eklenir.
5. Paket hashleri ve manifest hashleri teslim formuna yazılır.
