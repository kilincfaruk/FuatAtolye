# FuatAtolye - Altın Fiyatı API Kurulumu

## Gereksinimler
- Node.js (v18 veya üzeri)
- npm

## Kurulum Adımları

### 1. Backend API Kurulumu

```powershell
# Server klasörüne git
cd server

# Bağımlılıkları yükle
npm install

# Server'ı başlat
npm start
```

Server `http://localhost:3001` adresinde çalışacak.

### 2. Frontend Kurulumu

Yeni bir terminal açın:

```powershell
# Ana klasöre dön (eğer server klasöründeyseniz)
cd ..

# Frontend'i başlat
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacak.

## Kullanım

1. **İki terminal açın**:
   - Terminal 1: Backend server (`cd server && npm start`)
   - Terminal 2: Frontend (`npm run dev`)

2. **Tarayıcıda açın**: `http://localhost:5173`

3. **Altın fiyatı**: Navbar'da otomatik olarak görünecek (10 saniyede bir güncellenir)

## API Endpoints

- `GET http://localhost:3001/api/gold-price` - Güncel altın fiyatı
- `GET http://localhost:3001/api/health` - Server durumu

## Sorun Giderme

### Backend çalışmıyor
- `server` klasöründe `npm install` komutunu çalıştırdığınızdan emin olun
- Port 3001'in başka bir uygulama tarafından kullanılmadığını kontrol edin

### Altın fiyatı görünmüyor
- Backend server'ın çalıştığından emin olun
- Tarayıcı konsolunu kontrol edin (F12)
- `http://localhost:3001/api/gold-price` adresini tarayıcıda açıp yanıt alıp almadığınızı kontrol edin

### CORS hatası
- Backend server'ın çalıştığından emin olun
- Frontend'in `http://localhost:5173` adresinde çalıştığından emin olun
