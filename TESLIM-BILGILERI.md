# TESLİM BİLGİLERİ — forma yapıştırılacak hazır metinler (Madde 5.2)

Teslim ekranı: https://game.ktimo.com.tr/jam/teslim · Giriş: takım adı + organizasyonun verdiği 6 karakterli kod (harf/rakam, büyük-küçük fark etmez). Son yükleme başlangıcı: **Pazar 18 Ekim 18:00**.

## 1. Oyun adı
FAYT

## 2. Kısa açıklama
FAYT, deprem gelmeden önce hazırlanmayı öğreten tek bir oyun içinde iki ölçeği birleştirir. Önce 3 turda Girne'nin 9 mahallesini bütçeyle güçlendirir, tatbikatlar yapar ve yayılan riskleri (elektrik/yangın, gaz, tıkalı tahliye yolu, zayıf yapı, bilgi kirliliği) kapatırsınız; 3. tur bitince deprem olur. Harita Konutlar mahallesine yakınlaşır ve bir annenin çocuğuyla evde hayatta kalmasını yönetirsiniz: afet çantası, eşya sabitleme, Çök–Kapan–Tutun, karanlıkta ve artçı sarsıntıda tahliye. Şehirde yaptığınız hazırlık, evdeki hayatta kalma şansınızı doğrudan değiştirir; sonunda şehir ve ev puanı birleşik sonuç ekranında gösterilir.

## 3. Platform
Web (masaüstü tarayıcı). Windows sürümü yok.

## 4. Dosyalar
| Alan | Dosya / bağlantı |
|---|---|
| Oyun ZIP'i | `FAYT-oyun.zip` (≈1 MB) |
| Video (≤1 dk, MP4) | `FAYT-tanitim.mp4` (57 sn, 1280×720, sessiz) |
| Web oyunu bağlantısı (HTTPS, girişsiz) | **<buraya yayın adresi>** (bkz. aşağıdaki "Yayın") |
| Public repo (HTTPS) | https://github.com/1deger/game_jam |

## 5. Kurulum, çalıştırma ve kontroller
Kurulum yok. ZIP'i çıkarın, `index.html` dosyasına çift tıklayın (Chrome/Edge/Firefox/Safari; internet gerekmez). Tek dosya olarak `FAYT-tek-dosya.html` de aynı oyundur. Ses açık olsun, pencere ≥1280×720 olsun.
Kontroller: fare ile her şey; **Enter** = başlat, **Boşluk** = turu bitir (şehir haritası), **1–4 / Q / E** = ev sahnesinde kişi/masa seçimi, **Esc** = duraklat, **M** = ses aç/kapat. Tatbikatlarda ekranda yazan yönergeler geçerlidir.
Oyun akışı: Oyna → şehir haritasında 3 tur (mahalleye tıkla → kademe satın al ya da ücretsiz tatbikat; yetmezse turu bitir) → deprem → ev bölümü (hazırlık → deprem → tahliye) → ortak sonuç.
Bilinen sorun: yok bildirilmedi; ses sentezlendiği için tarayıcı ilk tıklamadan sonra ses başlatır.

## 6. Hazır kaynak beyanı
| Kategori | Seçim | Açıklama |
|---|---|---|
| Görsel | Kullanılmadı | Tüm görseller kodla (Canvas/SVG) üretildi. |
| Ses | Kullanılmadı | Ses dosyası yok; hepsi Web Audio ile sentezlenir. Beethoven 5. Senfoni'nin kamu malı 4 notalık motifi kodla çalınır. |
| Kod | Kullanılmadı | Dış kütüphane yok; saf HTML/CSS/JS. |
| Metin | Kullanılmadı | Dış metin kaynağı yok. |
| Diğer | **Kullanıldı** | Barlow ve Barlow Condensed yazı tipleri — SIL Open Font License 1.1 (Barlow Project Authors, @fontsource). Lisans: `FONT-LICENSE-OFL.txt`. |

## 7. AI beyanı
| Kategori | Seçim | Araç / amaç / kullanım yeri |
|---|---|---|
| Görsel | **Kullanıldı** | Claude (Anthropic) ve OpenAI Codex (ilk etap): ev sahnesi, karakter, harita, ikon ve arayüzü çizen Canvas/SVG kodunun yazımı. Resim üreten model kullanılmadı. |
| Ses | **Kullanıldı** | Claude ve OpenAI Codex: Web Audio ses efektleri, arka plan gerilim katmanı ve Beethoven motifi sentez kodu. Ses modeli kullanılmadı. |
| Kod | **Kullanıldı** | Claude / Claude Code ve OpenAI Codex: oyunun tüm mantığı, mini oyunlar, puanlama ve test betikleri. |
| Metin | **Kullanıldı** | Claude ve OpenAI Codex: afet bilgileri, görev/ipucu/arayüz metinleri; son kontrol ekipte. |
| Diğer | Kullanılmadı | — |

## 8. Kabul
Teslim koşulları ve güncel kural sürümü kabul kutusu, **takım temsilcisi tarafından** forma girilerek işaretlenir.

## Yayın (web bağlantısı ve public repo için)
Web bağlantısı HTTPS ve girişsiz olmalı. En kolayı GitHub: public repo oluşturun, bu klasörün içeriğini yükleyin, Settings → Pages → "Deploy from branch (main /root)" seçin; adres `https://<kullanıcı>.github.io/<repo>/` olur. Alternatif: itch.io'ya ZIP'i "HTML" olarak yükleyip herkese açık yapın. Teslimden sonra repo ve bağlantı değerlendirme bitimine kadar açık kalmalı.

## Teslim sonrası kontrol listesi
- [ ] Makbuz numarası, sürüm, kayıt zamanı ve dosya adları not edildi (madde 5.5)
- [ ] ZIP ve video yüklendi ve doğrulandı (ikisi de olmadan makbuz oluşmaz)
- [ ] Web bağlantısı gizli pencerede açılıyor, repo giriş istemiyor

> Not: Proje geçmişinde (`CHANGELOG_AI.md`) ilk etap OpenAI Codex ile yapılmış görünüyor; sonraki tüm değişiklikler Claude ile. AI tablosunda ikisi de yazıldı. Kendi kullandığınız başka araç varsa forma ekleyin.
