# Depoya aktarım doğrulaması

Tarih: 18 Ekim 2026. Bu belge, yüklenen FAYT paketinin bu depoya aktarımı
sırasında yapılan kontrolleri kaydeder. `TEST_SONUCLARI.md` paketle gelen geçmiş
rapordur; oradaki bütün testler bu aktarımda yeniden çalıştırılmadı.

## Geçen kontroller

- ZIP içindeki bağımsız HTML ile ayrıca yüklenen HTML, değişiklik öncesi bayt
  düzeyinde aynıydı. Ayrıca yüklenen teslim belgesi de pakettekiyle aynıydı.
- Yedi JavaScript dosyası `node --check` ile sözdizimi kontrolünden geçti.
- Linux Chromium + Playwright, 1280×720; Python yerel HTTP sunucusu üzerinden
  hem `index.html` hem `FAYT-tek-dosya.html` için:
  - Ana menü ve Oyna düğmesi görünür.
  - Oyna düğmesi şehir haritasını açar.
  - Esc duraklatma penceresini açar; Devam et pencereyi kapatır.
  - Tur bitirme, varsa acil risk uyarısının ardından tekrar onaylanarak,
    şehir HUD'ını 1. turdan 2. tura geçirir.
  - Bu akışlarda JavaScript sayfa hatası, konsol hatası, HTTP hata yanıtı
    veya haricî ağ isteği gözlenmedi.
- Tek dosyalı dağıtıma MIT ve font OFL metinleri eklendikten sonra aynı
  tarayıcı kontrolleri tekrar başarıyla tamamlandı.

İlk tur testi 300 ms sonra sonuç beklediği için başarısız oldu. Oyun kodu
incelendi: acil risk için tekrar onay ve tur geçiş animasyonları var.
Kontrol, kullanıcı akışını izleyip HUD'da 2. turu bekleyecek biçimde
 düzeltildi; oyun mantığı değiştirilmedi.

## Kapsam dışı

Tam oyun sonu, bütün tatbikatlar, sesin işitsel kalitesi, diğer tarayıcılar,
GitHub Pages yayını ve teslim formu doğrulanmadı. Bu kontrol tam regresyon
testi yerine geçmez. Tarayıcı otomasyonu ortamda bulunan Playwright ile
geçici bir betikten çalıştırıldı; oyun için Playwright kurulumu gerekmez.
