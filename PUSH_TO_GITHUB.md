# GitHub'a Push Etme Adımları

## 1. Git Kurulumu (Eğer yüklü değilse)
- https://git-scm.com/download/win adresinden Git'i indirin ve kurun
- Kurulum sonrası terminal'i yeniden başlatın

## 2. Git Repository'sini Başlat

Terminal'de proje klasörüne gidin ve şu komutları çalıştırın:

```bash
cd c:\Users\kilin\.gemini\antigravity\scratch\FuatAtolye

# Git repository'sini başlat
git init

# Tüm dosyaları ekle (.env hariç - zaten .gitignore'da)
git add .

# İlk commit
git commit -m "Initial commit: FuatAtolye production ready"
```

## 3. GitHub'da Repository Oluştur

1. https://github.com adresine gidin ve giriş yapın
2. Sağ üstteki "+" butonuna tıklayın → "New repository"
3. Repository adı: `FuatAtolye` (veya istediğiniz isim)
4. **Private** seçin (önerilen - güvenlik için)
5. **README, .gitignore, license eklemeyin** (zaten var)
6. "Create repository" butonuna tıklayın

## 4. Remote Ekle ve Push Et

GitHub'da oluşturduğunuz repository'nin URL'sini kullanın:

```bash
# Remote repository'yi ekle (KULLANICI_ADI'nı değiştirin)
git remote add origin https://github.com/KULLANICI_ADI/FuatAtolye.git

# Branch'i main olarak ayarla
git branch -M main

# Push et
git push -u origin main
```

GitHub kullanıcı adı ve şifreniz istenecek. Eğer 2FA aktifse, Personal Access Token kullanmanız gerekebilir.

## 5. Sonraki Değişiklikler İçin

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

## Önemli Notlar

✅ `.env` dosyası `.gitignore`'da olduğu için commit edilmeyecek
✅ `.env.example` commit edilecek (template olarak)
✅ Supabase bilgileri kodda değil, `.env` dosyasında

## Sorun Giderme

### "git: command not found" hatası
- Git yüklü değil, yukarıdaki adım 1'i takip edin

### "Authentication failed" hatası
- GitHub kullanıcı adı/şifre yanlış
- 2FA aktifse Personal Access Token kullanın: https://github.com/settings/tokens

### ".env dosyası commit edildi" uyarısı
- `.gitignore` dosyasını kontrol edin
- Eğer commit edildiyse: `git rm --cached .env` sonra tekrar commit edin
