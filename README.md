# FAYT · Deprem gelmeden hazırlan

**Girne’yi hazırla. Evini koru. Birlikte hayatta kal.**

FAYT, deprem hazırlığını şehir yönetimi ve evde hayatta kalma akışıyla birleştiren,
Türkçe bir tarayıcı oyunudur. Girne’nin kurgusal dokuz mahallesinde bütçeni yönet,
riskleri azalt ve tatbikatlara katıl. Üç turluk şehir hazırlığından sonra bir anne
ve çocuğunun evdeki hazırlık, deprem ve tahliye sürecini yönet.
Şehirde aldığın kararlar ev bölümündeki koşulları etkiler; iki bölümün puanları
ortak sonuç ekranında birleşir.

## Hemen çalıştır

1. Depoyu indir veya `git clone https://github.com/1deger/game_jam.git` komutuyla klonla.
2. `index.html` dosyasını güncel bir masaüstü tarayıcıda aç.
3. Alternatif olarak yalnızca **[FAYT-tek-dosya.html](FAYT-tek-dosya.html)** dosyasını indirip açabilirsin.

Kurulum, derleme, hesap veya internet bağlantısı gerekmez. Ses ilk kullanıcı
etkileşiminden sonra başlar. Önerilen pencere boyutu en az **1280 × 720**.
Tarayıcı yerel dosya erişimini engelliyorsa Python 3 ile depo kökünde:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Ardından tarayıcıda `http://127.0.0.1:8000` adresini aç.

## Oyun akışı

1. **Şehir:** Mahallelere yatırım yap, ücretsiz tatbikatları tamamla, yayılan riskleri azalt.
2. **Deprem:** Şehir hazırlığının sonuçlarını gör ve ev bölümüne geç.
3. **Ev:** Afet çantası, eşya sabitleme, Çök–Kapan–Tutun ve tahliye kararlarını uygula.
4. **Sonuç:** Şehir ve ev performansının birleşik değerlendirmesini gör.

## Kontroller

| Tuş / giriş | İşlev |
| --- | --- |
| Fare | Menü, mahalleler, görevler ve etkileşimler |
| Enter | Ana menüden başlat; uygun ara ekranlarda ilerle |
| Boşluk | Şehir haritasında turu bitir |
| 1–4 | Deprem ve sonrası ev sahnesinde kişi seç |
| Q / E | Deprem ve sonrası ev sahnesinde masa / çalışma masası seç |
| Esc | Duraklat / devam et |
| M | Sesi aç / kapat |

Tatbikatlarda ekrandaki özel yönergeleri takip et. İlerleme ve ses tercihleri,
tarayıcı izin verdiğinde `localStorage` ile yerel olarak saklanır.

## Geliştirme ve dosyalar

Oyun saf HTML, CSS ve JavaScript kullanır. Paket yöneticisi veya harici çalışma
zamanı kütüphanesi yoktur. `index.html` geliştirme giriş noktasıdır.

| Dosya | İçerik |
| --- | --- |
| `game.js` | Ana oyun akışı, arayüz ve ev senaryoları |
| `city.js`, `drills.js` | Şehir kampanyası ve tatbikatlar |
| `data.js` | Oyun verileri |
| `art.js`, `icons.js` | Canvas / SVG çizimleri |
| `audio.js` | Web Audio ile sentezlenen sesler |
| `style.css`, `fonts.css` | Arayüz ve gömülü yazı tipleri |
| `FAYT-tek-dosya.html` | CSS, JS ve fontları içeren bağımsız dağıtım |

Tek dosyalı sürüm, kaynak dosyaların otomatik eşzamanlanan bir bağlantısı değildir.
Kaynakları değiştirdiğinde dağıtımı da güncelle ve her iki giriş noktasını kontrol et.

## Doğrulama ve proje kayıtları

- [Bu sürümün kontrolü](VALIDATION.md): depoya aktarım sırasında yapılan kontroller.
- [Önceki test raporu](TEST_SONUCLARI.md): yüklenen paketle gelen geçmiş kayıt;
  rapordaki haricî test betikleri bu depoda bulunmayabilir.
- [Kaynak ve AI beyanı](KAYNAKLAR.md).
- [Geliştirme geçmişi](CHANGELOG_AI.md).
- [Teslim bilgileri](TESLIM-BILGILERI.md): organizasyon formu için taslak bilgiler;
  video dosyası bu depoya dahil değildir.

## Lisans

Proje kodu ve özgün içerik **[MIT](LICENSE)** lisansı altında sunulur.
Barlow ve Barlow Condensed fontları **[SIL OFL 1.1](FONT-LICENSE-OFL.txt)**
lisanslıdır; MIT kapsamına girmez. Ayrıntılar: [üçüncü taraf bildirimleri](THIRD_PARTY_NOTICES.md).
Tek HTML dosyası da ilgili lisans metinlerini içerir.

Oyun eğitim ve farkındalık amaçlıdır; resmî afet kılavuzu yerine geçmez.
Girne haritası ve nüfus dağılımı kurgusaldır.
