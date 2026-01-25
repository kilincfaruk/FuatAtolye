# Kuyumcu Atölyesi Takip Uygulaması

Atölye yönetimi için müşteri, işlem, tahsilat, gider ve fiyat listesi yönetimi sunan React + Supabase uygulaması.

## Özellikler
- İşlem, ödeme ve gider kayıtları
- Yapılan iş / fiyat listesi yönetimi
- Has altın ve gümüş takibi
- Dashboard özetleri ve müşteri bazlı bakiye görünümü
- Adisyon yazdırma
- Canlı altın fiyatı (serverless API)

## Kurulum

### 1) Ortam değişkenleri
`.env` dosyası oluşturun:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2) Bağımlılıklar
```
npm install
```

### 3) Local geliştirme
```
npm run dev
```

## Sunucu / API

### Local altın fiyatı (opsiyonel)
Server klasörünü ayrı başlatabilirsiniz:
```
cd server
npm install
npm run dev
```

### Vercel serverless endpoint
Üretimde altın fiyatı için `/api/gold-price` endpoint’i kullanılır.
Vercel’de aşağıdaki değişkenleri ekleyin:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
GOLDAPI_KEY
```

## Supabase
Şema dosyaları `supabase/` klasöründedir. Yeni kolonlar için:
```
supabase/schema.sql
```

Gümüş tahsilat için gerekli kolon:
```
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS silver_amount numeric;
```

## Deploy
Vercel kullanımı önerilir. Environment variables ekleyip deploy edin.
