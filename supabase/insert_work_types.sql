-- FuatAtolye - İş Türleri ve Fiyat Listesi
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- Önce mevcut verileri temizle (opsiyonel)
-- DELETE FROM public.work_types;

-- Fiyat listesini ekle
INSERT INTO public.work_types (name, default_price, is_active) VALUES
('YÜZÜK KÜÇÜLME', 150, true),
('ZİNCİR YALDIZ', 150, true),
('BİLEKLİK YALDIZ', 150, true),
('KÜÇÜLTME VE YALDIZ', 200, true),
('BÜYÜTME VE YALDIZ', 200, true),
('YÜZÜK BÜYÜME', 150, true),
('PARÇALI BÜYÜME VE YALDIZ', 300, true),
('PARÇALI BÜYÜME', 200, true),
('KÜPE KOLYE ZİNCİR TEK LAZER', 150, true),
('PIRLANTA BAKIM VE RODAJ', 300, true),
('YÜZÜK RODAJ', 300, true),
('KÜPE ÇİFTİ RODAJ', 300, true),
('İNCE ZİNCİR KOLYE RODAJ', 300, true),
('FANTAZİ BİLEZİK ÇİFT TARAFLI KISALTMA CİMAR', 400, true),
('ROLEX KISALTMA', 250, true),
('BİLEKLİK KISALTMA ÇİFT TRF', 200, true),
('TAKIM KISALTMA', 400, true),
('SET TAKIM KOMPLE RODAJ', 1000, true),
('KİLİTLİ KISALTMA ÇİFT TARAF VE YALDIZ', 500, true),
('PIRLANTA KÜÇÜLME VE RODAJ', 350, true),
('PIRLANTA BÜYÜME VE RODAJ PARÇALI', 400, true),
('TRABZON KISALTMA VE CİMAR', 750, true),
('LAZER KAYNAK', 150, true),
('ÇİFT ALYANS PANTORAF', 150, true),
('TEK PANT ALYANS', 75, true),
('KÜNYE PANTORAF', 150, true),
('KOLYE PANTORAF TEK TARAF', 150, true),
('GÜMÜŞ KÜÇÜLME', 150, true),
('GÜMÜŞ PARÇALI BÜYÜME', 200, true),
('İSİM KOLYE İŞÇİLİK', 1000, true),
('AİLE İSİM KOLYE', 750, true),
('GÜMÜŞ İSİM KOLYE ZİNCİRLİ', 1000, true),
('SONSUZLUK İSİM KOLYE 1 İLA 1,5 GRAM ARASI', 1000, true),
('GÜMÜŞ SONSUZLUK KOLYE İSİMLİ SADE', 750, true),
('KABARTMA KÜNYE', 500, true),
('BİLEZİK RODAJ YAPIMI AJDA MODEL', 500, true),
('BİLEZİK ROZ YAPIM AJDA', 250, true),
('TESBİH PÜSKÜL YAPIMI ALTIN HARF BAŞI', 200, true),
('TESBİH PÜSKÜL YAPIMI İSİM BAŞI GÜMÜŞ', 250, true),
('GERDANLIK DİZİMİ VE CİMAR ÇOKLU', 350, true),
('FOTOĞRAF İŞLEME LAZER', 750, true),
('SAMANYOLU KISALTMA YALDIZ', 300, true),
('FANTAZİ BİLEKLİK ÇİFT TARAFLI KISALTMA CİMAR', 300, true),
('ARAPÇA PANTORAF VE ÇİZİM', 200, true),
('HALAT KISALMA CİMAR', 200, true),
('HALAT TAMİR CİMAR', 200, true),
('HALAT KÜNYE ÇİFT TARAF KISALMA CİMAR', 300, true),
('İNCİ DİZİM', 200, true)
ON CONFLICT (name) DO UPDATE SET 
  default_price = EXCLUDED.default_price,
  is_active = EXCLUDED.is_active;

-- Sonucu kontrol et
SELECT COUNT(*) as toplam_is_turu FROM public.work_types;
SELECT * FROM public.work_types ORDER BY name;
