# Test özeti — BüyükFelaket

## Doğrulanan sürüm ve ortam

- Etkin proje: `/workspace/game_jam/BuyukFelaket/index.html` ve yanındaki JS/CSS dosyaları.
- Orijinal yedek: `/workspace/BuyukFelaket_backup`.
- Linux üzerinde sistem Chromium'u, global Playwright ve 1280×720 görünüm.
- Oyun bağımlılığı kurulmadı. Npm, framework, derleme veya harici asset eklenmedi.
- Bu makinenin yönetilen Chromium politikası `file://` gezinmesini `ERR_BLOCKED_BY_ADMINISTRATOR` ile reddetti. Bu politika değiştirilmedi. Tarayıcı testleri yalnız iç doğrulama amacıyla `127.0.0.1:8765` üstünden çalıştı; bu sunucu oyunun bağımlılığı değildir.

## Çalıştırılan kontroller

`node /workspace/qa/regression.cjs`: **43 geçti, 0 başarısız; 0 pageerror, 0 konsol hatası**.

Bu kontroller:

- Menü → Nasıl oynanır → Oyna → 9 mahalle ve bütçeli HUD.
- Aynı satın alma basamağını tekrar çalıştırma: ikinci kademe alınmaz. Su hattında geçici önlem: komşu kademe düşmez.
- Şehir puanı 3/4/5 tur fırsatına göre normalleşir; 6,5/7,5 büyüklük karşılaştırması puanı değiştirmez. Açık risk puanı azaltır; hiçbir hazırlık yapmama şehir puanı sıfırdır.
- Okul, Eski Liman, Hastane, Çarşı, Afet Merkezi, Su Deposu, Cami Meydanı ve Liman'ın başarı ile zaman aşımı/başarısızlık yolları. Başarıda kademe, yıldız, sonuç ekranı ve haritaya dönüş.
- Dokuzuncu mahalle Konutlar: üç tehlike gidererek ücretsiz kademe, evde kalıcı sabitlemeler; hazırlıksız bitirince başarısızlık.
- Beş mikro oyun: elektrik riski, gaz, söylenti, tahliye yolu, boru bağlantısı; her biri başarı ve zaman aşımından sonra haritaya döner. Başarı riski kapatır, başarısızlık kapatmaz.
- Esc ile tatbikat süresi ve gecikmiş işler donar; tekrar girince eski tatbikat işleri sızmaz.
- İlk acil risk 60 sn, sonraki 40 sn; mahalle penceresinde sayaç durur.
- `CT.quakeTurn` 3, 4, 5 zorlanarak gerçek tur sonu işleyicisi: öncü uyarı ve şehir sonucu gelir.
- Şehir sonucu → köprü → `campPlan` ile 0, 1, 2, 5 numaralı evler → ana sarsıntı → sonrası/artçı → 72 saat → ev sonucu → ortak skor.
- `g72p` rekoru kaydeder, yenilemede menü gösterir; eşit puan yeni rekor sayılmaz.
- localStorage erişimi `SecurityError` verecek biçimde engellenmiş ayrı tarayıcıda menü, ses kapama, şehir, ev, ortak skor ve kayıt denemesi hata vermeden işler.
- 1280×720, 800×600, 640×360, 1920×1080 pencerelerinde sahne oranı korunur ve pencere dışına taşmaz.
- Oyun oturumu sırasında harici ağ isteği yok.

Zamanlı tatbikatların ve ev simülasyonunun çoğunda üretim işleyicileri, kontrollü zaman adımlarıyla hızlandırıldı. Amaç bütün sonuç yollarını doğrulamaktır; bunlar insan oyuncu hızını, öğrenme eğrisini veya 48 saatlik soak testini kanıtlamaz. Harita turları, odak/Enter/Esc ve bazı beklemeler gerçek tarayıcı olaylarıyla da çalıştırıldı.

`node /workspace/qa/extra.cjs`: görev kartı **Tahliye Koridoru → tamamlandı → kayboldu → Dayanıklı Konut Programı**; mahalleyi klavyeyle açma; pencerenin sahne içinde kalması; Esc aç/kapat; azaltılmış hareket tercihi; menüde önceki sistem rekoru; görünen yardım ekranında 12 px altı metin bulunmaması. **Hata yok.** İlk ek test denemesi yanlışlıkla aynı `data-site` taşıyan görev satırını seçtiği için zaman aşımına uğradı; test seçicisi gerçek `.site` düğmesiyle düzeltildi, tekrar çalıştırıldı ve geçti. Oyun arızası değildi.

`node /workspace/qa/storage.cjs`: bozuk JSON, yanlış türde yıldız/puan alanları ve sınır dışı sayılar içeren **3 kayıt** menüyü bozmadı; eski %92 kampanya rekoru “Önceki sistem” olarak göründü; **0 pageerror**.

`node /workspace/qa/capture.cjs before|after`: menü, yardım, harita/HUD, 9 tatbikat, 5 mikro oyun, minires, şehir sonucu, köprü, dört ev, deprem, sonrası, 72 saat, ev sonucu ve ortak sonuç görüntüleri alındı ve görsel olarak incelendi. Görseller `/workspace/qa/before` ve `/workspace/qa/after` içinde. İlk HTTP incelemesindeki tarayıcı favicon 404'ü gömülü sismograf simgesiyle giderildi; oyunun asset yüklemesiyle ilgili eksik dosya yoktu.

Statik kontroller: JS sözdizimi; etkin index/JS/CSS'te dış URL, modül, fetch/XHR/WebSocket/service worker yok; mevcut fontlar base64 gömülü. `README.md`, `KAYNAKLAR.md`, lisans/fontlar ve eski tek dosya HTML, yedekle bayt düzeyinde aynı.

Ham sonuçlar: `/workspace/qa/results.json`, `/workspace/qa/extra-results.json`. Test yardımcıları projenin runtime parçası değildir.

## Takımın elle kontrol etmesi gerekenler

1. **Zorunlu son kontrol:** bütün klasörü Windows'a alıp **index.html** dosyasına çift tıklayın. İnterneti kapatın; menüden ortak skora kısa bir oyun tamamlayın. Bu makinede `file://` engelli olduğundan bu sonucu geçti diye raporlamıyoruz.
2. Windows Chrome/Edge'de gerçek ses seviyeleri, ilk kullanıcı hareketinden sonra ses açılması, sessiz tercihin yenilemeden sonra sürmesi; fiziksel hoparlörde ses dengesi. Otomasyon işitsel kaliteyi değerlendirmez.
3. Jüri akışında gerçek insanla ilk 60 saniye ve üç dakikalık sunum provası. Yeni skor eşikleri matematik ve regresyonla kontrol edildi; geniş oyuncu grubuyla denge ölçümü yapılmadı.
4. Gerçek sekme değiştirme, işletim sistemi pencere boyutlandırma, yüksek DPI, tarayıcı yakınlaştırması, çok hızlı fare tıklamaları; görsel okunabilirlik. Sahne oranla küçüldüğü için çok küçük pencerelerde yazılar fiziksel olarak küçülür; 1280×720 veya üzeri önerilir.
5. WCAG AA hedefiyle kontrast ve odak iyileştirildi, fakat bağımsız tam WCAG/ekran okuyucu denetimi yapılmadı. Canvas anlatımı ve ayrıntılı sahne bilgileri hâlâ görsel ağırlıklıdır.
6. Clipboard izinleri özellikle `file://` altında farklı olabilir. Kopyalama reddedilirse seçilen metni Ctrl+C ile kopyalayın; bu Windows yolu ayrıca denenmelidir.
7. Rastgele riskler ve komşuluk düzeni oynanışı hâlâ etkiler. 3/4/5 tur ve büyüklük normalleşmesi tüm rastlantısallığı kaldırmaz. Kişi kaybı ve harita bilimsel tahmin değildir.
8. Eski gizli gaz/yangın/orman senaryosu dalları geniş silme riski nedeniyle kaynaklarda duruyor; normal görünür kampanya yalnız deprem ve ev indeksleri 0/1/2/5 kullanır.
9. **Eski `BuyukFelaket-tek-dosya.html` bu değişiklikleri içermez.** Kullanılacak giriş **index.html**. Kullanıcının bu etap talebi doğrultusunda ZIP/tek dosya build, README/KAYNAKLAR ve teslim hazırlığı yapılmadı.

## Bulut ortamı

Yeniden başlatma/QA yönergeleri ortamın `start_skill` taslağına kaydedildi. `install_script` gerekmedi; oyun statik ve bağımlılıksız. Taslak kaydı yayınlama değildir. Ortamı gelecekte kullanmak için ortam ayarlarında değişiklikleri inceleyip kaydedin, ardından ortamı yayımlayın. Yeni görevde snapshot geri yükleme ayrıca doğrulanmadı.


## Sonraki indirme isteği

Kullanıcı daha sonra indirilebilir Mac paketi ve GitHub'a ayrı dal yüklemesi istedi. Bu aşamada `BuyukFelaket-tek-dosya.html` güncel kaynaklardan üretildi; repo kökünde aynı oyun `OYUNU-AC.html` olarak da yer alır. Önceki “tek dosya güncellenmedi/ZIP yok” notları ilk etabın tarihsel durumudur. Güncel `BuyukFelaket-Mac.zip` içindeki tek dosya kullanılabilir. Arşiv bütünlüğü ve paketlenmiş HTML'nin menü, 9 mahalle, Esc duraklatma akışı kontrol edildi; konsol/pageerror ve harici istek yok. Mac/Safari çift tıklama testi hâlâ kullanıcıda yapılmalıdır.

## İkinci geliştirme etabı — beş yeni özellik

- Temel `regression.cjs`: **43 geçti; 0 başarısız; 0 pageerror/konsol hatası**.
- `/workspace/qa/upgrade-tests.cjs`: **8 geçti; 0 başarısız; 0 pageerror/konsol hatası; 0 harici istek**.
- Yeni kontroller: alınan kademeyle çalışma ekibinin belirmesi; aile mesajlarının gerçek bonuslara dayanması ve çoğalmaması; başarıyla çizilen iki güzergâhın tam hücre dizileriyle kaydı ve sonuçta çizimi; depremde yürüyüşün durup yalnız sarsıntı sonrası tahliyenin başlaması; şehir önce/sonra kartları; köprüde aile mesajları ve evde miras sabitlemeler; dolu masanın dördüncü kişiyi reddetmesi ve E ile diğer masaya yönlendirme; gerçek avize yaralanmasının Anne adıyla hikâyeye girmesi ve avize önlemi alınınca bu yaralanmanın oluşmaması; kişisel ev kanıt kartı; azaltılmış hareket tercihi; yeni kampanyada aile/rota/görsel durumunun temizlenmesi.
- Görsel inceleme: `/workspace/qa/after/living-map.png`, `route-evacuation.png`, `city-evidence.png`, `shelter-controls.png`, `personal-result.png`; ayrıca mevcut tüm ekran yakalama akışı yeniden çalıştırıldı, konsol hatası yok.
- Şehirdeki nüfus hareketi ve önce/sonra kartları şematik anlatımdır; bilimsel can kaybı öngörüsü veya ek gizli puan bonusu değildir. Kaydedilen tatbikat yolları, sonuç kartındaki minyatürde gerçek çizilen yollarla gösterilir; şehir haritasındaki koridor, mahalle ölçeğindeki şematik temsildir.
- Mac/Safari ve Windows'ta `file://` elle kontrol sınırı devam eder. Testler bulut Chromium'unda iç HTTP sunucusunda yapıldı; dağıtım dosyasında internet/sunucu bağımlılığı yoktur. Gerçek hoparlör, gerçek insan öğrenme süresi ve uzun süreli denge testi ayrıca yapılmalıdır.
- Üretilmiş tek HTML üzerinde aynı sekiz özellik kontrolü ayrıca çalıştırıldı (`upgrade-bundle.cjs`): **8/8 geçti, konsol/pageerror yok, harici istek yok**. ZIP içindeki HTML ile repo kökündeki `OYUNU-AC.html` bayt düzeyinde eşit; arşiv CRC kontrolü geçti.

## Üçüncü etap — kural düzeltmeleri ve yardım sistemi

Güncel ortak skor sürümü v3'tür; eski v2 rekoru ayrı tutulur. Kayıp sayısı, evin şehir puanına katkısını değiştirmez. Ortak puan sınırları, tamamlanmayan tahliye için ekranda açıkça belirtilir.

- Temel 43 regresyon: **43/43 geçti**.
- İkinci etap özellik kontrolleri: **8/8 geçti**.
- Yeni `/workspace/qa/rule-tests.cjs`: **13/13 geçti**, konsol/pageerror yok, harici istek yok. Ham kayıt: `/workspace/qa/rule-results.json`.
- Kontroller: gaz/elektrik risk türü korunması; dört kalıcı görev avantajının kademe kaybından sonra sürmesi; tek eylemde iki görev kazanımı ve tekrar ödül üretmeme; RNG/20 sn okuma beklemesinden bağımsız 0/1/1/2/2 acil risk yükü; hızlı tur sonuyla risk atlayamama; 200/900/1800 başlangıç Konutlar kaybında aynı ev puanının aynı ortak skoru vermesi; rota %5'inin gerçek etkisi, tekrar yığılmaması ve koridorla çarpılarak birleşmesi.
- Yardım kontrolleri: ağır yaralı yerinden yürümez; içeriden yardım isteği kabul edilmez; bir aile üyesi güvenli alana çıkınca gerçek DOM düğmesiyle yardım istenir; yardımla çıkarılınca ağır yaralanma bilgisi sürer; yardım istenmezse kişi yardım bekler, kamp sahnesinde görünmez ve puana yansır. Hiç kimse çıkmadığında düşük ev puanı/ortak puan sınırı ve doğru 72 saat anlatımı gösterilir. Esc, yardım saatini durdurur. Ulaşamayan Nine/Pamuk için ilaç/mama başarısı üretilmez.
- Görsel incelemede yeni yardım paneli, masa paneli, görev etiketi ve renkler kontrol edildi; Okul konumu görev panelinden ayrıldı. Ekran örneği: `/workspace/qa/after/heavy-rescue.png`.
- İlk yeni test turundaki bir başarısızlık, önceki puan testinden bırakılmış eksik yapıda yapay kamp verisiydi. Yardım testinin başlangıcı gerçek yeni ev koşuluna (`S.camp=null`) alındı; tekrarında tüm kontroller geçti. Uygulama dosyası bu test hatasını gizlemek için değiştirilmedi.

**Sınırlar:** 6 sn yardım ve 32 sn tahliye, yalnız oyunun değerlendirme süreleridir; gerçek afet müdahalesine dair süre/sonuç iddiası değildir. Oyuncu ağır yaralıyı taşımaz; güvenli alandan uzman yardım ister. Bazı zamanlı yollar üretim güncelleme işleyicileriyle hızlandırılarak test edildi. Mac/Safari ve Windows file:// son kontrolü bu bulut ortamında hâlâ yapılamıyor. Gerçek insanla oyun dengesi ve erişilebilirlik incelemesi ayrıca gerekir.

- Güncel tek HTML paketi üzerinde 13 yeni kural kontrolü ayrıca tekrarlandı: **13/13 geçti**, konsol/pageerror ve harici istek yok. ZIP CRC ve paket içi HTML eşitliği doğrulandı. Toplam **64 farklı kontrol** (43 + 8 + 13) başarılı.

## 2026-10-17 — Ses doğrulaması
- Kaynak sürüm: 43 regresyon + 13 mantık kontrolü geçti; tarayıcı çalışma hatası yok.
- Chromium OfflineAudioContext ile gerçek ses örnekleri üretildi: mobilya RMS 0.00586, düşük yoğunluk RMS 0.00199 (yaklaşık %66 azalma), tepe 0.0521 altında. Avize ve TV farklı sinyaller üretir. Bu ölçümler ilgili efektleri kapsar; her olası eşzamanlı miks için ölçüm değildir.
- Yoğunluk tercihi yeniden yüklemede korunur; duraklatma sırasında yeni ses birikmez; durdurma/sessiz sonrasında sonlu kaynak sayısı sıfıra iner. Yedi ses kontrolü geçti.
- Gerçek Mac/Safari, hoparlör/kulaklık üzerinde öznel dinleme bu Linux ortamında yapılmadı.
- Sekiz özellik kontrolü de geçti (toplam 64 oyun kontrolü). Üretilmiş tek HTML üzerinde 13 mantık ve yedi ses kontrolü tekrar geçti; ZIP CRC ve kaynak/tek HTML eşliği doğrulandı.

## 2026-10-17 — v5 süre/geçiş doğrulaması
- Altı hedefli Chromium kontrolü geçti: gazda eski 18 saniyelik sınırdan sonra oynanabilirlik ve 30 saniyelik sayaç; doğru işlem sırasıyla anında sonuç ve tek ödül; gerçek hareket/etkileşim işlevleriyle dört payanda ve dört turist tamamlanması; yürüyen son turistin varışını bekleme ve duraklatma; eksik görevde 50 saniye zaman aşımı; düşmüş taşla kısmi sonuç ve kusursuz bonusunun verilmemesi.
- Yeni testler oyun güncellemelerini hızlandırarak gerçek görev işlevlerini çalıştırır; gerçek zamanlı insan oynanışı veya Mac/Safari testi değildir.
- Ek olarak 43 regresyon ve 13 mantık kontrolü geçti. Altı yeni kontrol üretilmiş tek HTML üzerinde de geçti; tarayıcı hatası yok. ZIP CRC ve tek HTML/kaynak paket eşliği doğrulandı.

## 2026-10-17 — Kaybetme ve rekor doğrulaması
- Önceki 43 regresyon, 13 mantık, sekiz özellik ve altı görev süresi kontrolü geçti. Önceki testlerdeki eski davranış beklentileri güncellendi: kimsenin tahliye olmadığı tur artık düşük puanlı sonuç yerine Game Over verir; başarılı sonuç testleri kritik çanta malzemesini sağlar.
- Yeni hedefli tarayıcı kontrolleri: üçüncü krizi atlama ve süre dolmasıyla şehir kaybı, iki kayıptan sonra devam edebilme, şehir/ev yeniden deneme, yalnız hayvanın tahliyesinin aile başarısı sayılmaması, kritik çanta eşiği ve sonuç atlama koruması, yaralanmaya bağlı ilk yardım ihtiyacı, birleşik sonuç açılmadan rekorun kaydedilmesi, sayfa yeniden yüklemede korunması ve düşük skorla düşmemesi, oyun terimleri, gerçek hazırlık kademelerinin ışıklandırılması/rota akışı ve azaltılmış hareket, engellenen tarayıcı kaydında oturum içi koruma/bildirim.
- Game Over ve şehir ışıkları ekran görüntüleri incelendi. Testler Chromium/Linux üzerinde üretim işlevleriyle yapılır; Mac/Safari üzerinde insan oynanışı ve ses dinlemesi yapılmadı.
- 12 yeni kaybetme/rekor kontrolü hem kaynak sürümde hem son tek HTML paketinde geçti. Üçüncü kaçırmanın başarısız acil mini oyundan gelmesi de ayrıca doğrulandı. Toplam 82 farklı kontrol geçti; paket CRC ve tek HTML eşliği doğrulandı.

## 2026-10-17 — Sinematik ve boş çanta
- Sekiz yeni kontrol geçti: tüm senaryolarda eski otomatik eşya seçeneklerinin yok sayılması ve boş başlangıç; şehir planındaki hazır eşya vaatlerinin kaldırılması; normal maliyetle su seçip geri çıkarma; ilk şehirden eve giriş ve tekrarda bekletmeme; gerçek şehir hazırlığına bağlı tam ekran sekans; duraklatmada donma ve atlamayla doğru tahliye/sonuç akışı; ev sekansında deprem saatinin durması ve kontrolün geri verilmesi; tek bitiş, menüde iptal, azaltılmış hareket ve rekorun korunması.
- Şehir ve ev sekansları ekran görüntülerinden incelendi; kaynak sürümde tarayıcı hatası yok. Önceki testlerde ücretsiz çanta, eski kısa deprem süresi ve küçük bildirim beklentileri yeni davranışa göre güncellendi.
- 43 regresyon, 13 mantık, sekiz özellik, altı görev süresi ve 12 kaybetme/rekor kontrolü geçti. Gerçek Canvas fare tıklaması da hata vermedi. Mac/Safari üzerinde insan oynanışı, performans ve ses dinlemesi burada yapılmadı.
- Son tek HTML paketinde de sekiz yeni kontrol geçti; sekans içi Tab odağı atlama düğmesinde tutulur. Toplam 90 farklı kontrol geçti. Son ZIP CRC ve kaynak/tek HTML eşliği doğrulandı.

## 2026-10-17 — Bağlı tur planları
- Dokuz yeni kontrol kaynak sürümde geçti: 1–5. turlarda dört bağlı/komşu görev ve başlangıç bütçesine uygun maliyet; gerçek ilk tur UI'sında 6 ◆ ile dört adımın tamamlanması; 24 dk, iki indirim, gerçek yaklaşan risklerin engellenmesi ve ödülün tekliği; aynı fiziksel hazırlıkta sıralı/serbest yolun skor karşılaştırması; ücretsiz harita inceleme ve yetersiz ekip süresinde harcama yapılmaması; süre sıfırken risk müdahalesi/acil mini oyun muafiyeti; yeni turda sıfırlama ve geçmişin korunması; erken yapılmış işi imkânsız tekrar yükseltme yerine doğrulama; riskli/tam kademeli şehirde plan ve açık sonuç hesabı.
- 43 regresyon, 13 mantık, sekiz özellik, altı görev süresi, 12 kaybetme/rekor ve sekiz sinematik kontrolü geçti. Aile mesajı testinde çoklu bağımsız yatırım için ekip süresi test düzeneğinde yükseltildi; gerçek 6 ◆ başlangıcı ayrıca gerçek tıklamalarla test edildi.
- Görev paneli ekran görüntüsünden kontrol edildi. Testler Chromium/Linux üzerindedir; gerçek Mac/Safari üzerinde oynanmadı.
- Dokuz yeni kontrol üretilmiş tek HTML paketinde de geçti. Toplam 99 farklı kontrol geçti; tarayıcı hatası yok. ZIP CRC ve kaynak/tek HTML eşliği doğrulandı.

## 2026-10-17 — Görev tekrarı, su görevi ve Liman puanlaması
Playwright (Chromium, `127.0.0.1` üstünde geçici yerel sunucu, 1280×720) ile üretim işlevleri çağrılarak ölçüldü; sayfa hatası/konsol hatası: **0**.
- Acil risk: 40 simüle kampanya × (2.–5. tur: 1+1+2+2 = 6 acil risk). Aynı turda aynı tür: **0**; tam aynı tür+mahalle: **0**; aynı mahalle tekrarı: **0**. Altı acil risk beş türe dağıldığından türlerden tam bir tanesi kampanya başına bir kez tekrar eder (40/40; sayısal olarak kaçınılmaz). Tekrar eden türde içerik farklı seçilir.
- Bağlı görev planı: 40 kampanya × 5 tur. Ardışık turlarda ortak mahalle: **0**; aynı ikili: **0**. 5 turda 10 yer, 9 mahalle olduğundan ortalama ~2 mahalle bir kez daha görev alır (komşuluk kısıtı yüzünden alt sınır 1 değil).
- Mikro oyun içeriği: aynı kampanyada ardışık iki açılışta söylenti kartı örtüşmesi 0/8, yangın öğesi 0/6, uygunsuz su kabı 0/3, tahliye yolunda 2/7 (engeller 0/4 örtüştü; 4 ekipmandan 3'ü gösterildiği için en az 2 ekipman aynı kalır).
- Yedek su görevi: gerçek düğme tıklamasıyla kirli kap cezası, iyi kap seçimi, hedefe ulaşınca otomatik bitiş ve “RİSK KAPANDI” sonucu doğrulandı. Hedef 27/36/45 L (3/4/5 kişi); toplam iyi kap 51 L.
- Liman: aynı sahnede 4 strateji. Doğru sıra: %100, 3 yıldız. En kötü sıra: %8–17, 0 yıldız. Rastgele sıra: %42–81 (yıldız değişken). Süre aşımı: %50, bekleyenler sırayla bindirildi. Kimse açıkta kalmadı. Rastgele yerleştirme için 200 000 denemelik hesapta 2+ yıldız olasılığı yaklaşık %16, 3 yıldız yaklaşık %2.
- Hata yakalandı ve düzeltildi: tekne altyazısı güncellenirken ilk yolcunun etiketi üzerine yazılıyordu (`querySelector('small')` yolcu etiketini buluyordu); `:scope > small` ile düzeltildi, ekran görüntüsünden doğrulandı.
- Tam akış: menü → kampanya → acil risk mini oyunu → tur sonu → deprem sinematiği; hata yok. Gerçek insan oynanışı, Mac/Safari `file://` ve hoparlör kontrolü yapılmadı. Eski 99 kontrollük regresyon paketi bu ortamda bulunmadığından yeniden çalıştırılamadı; yalnız yukarıdaki hedefli kontroller çalıştırıldı.

## 2026-10-17 (ek) — Acil risk varyantları
Chromium/Playwright, hata 0. 40 kampanya × 6 acil risk: aynı tür+varyant tekrarı 0, art arda aynı mekanik 0. Panel başlıkları 3 farklı set. 10 yeni mini oyun (5 tür × soru/sıra) gerçek tıklamayla oynandı; 2/3 doğruyla da başarılı, haritaya dönüş çalıştı. Gerçek insan oynanışı yapılmadı.

## Ev bölümü komut hatası (Anne–Elif–Nine)
Neden: kişiler üst üste biniyordu (Karanlık Gece'de Anne 790 / Elif 860 / Nine 740) ve tıklama listedeki ilk kişiyi seçiyordu; komut tıklaması da seçim tıklamasıyla çakışıyordu.
Düzeltme: kişiler arası en az 64 px, tıklamada en yakın kişi, komut/seçim ayrımı.
Karşılaştırma testi (her kişiye komut): eski kod 80/120 çalıştı (Anne, Nine, Pamuk başarısız); yeni kod 120/120 (seviye 1: 36/36, 2: 48/48, 5: 36/36).

## 3 tur + deprem sonrası ev geçişi (Playwright)
3 tur oynanınca deprem; şehir animasyonu yok; Konutlar'a zoom (merkezlenmiş) → ev hazırlık ekranı; ev bitince doğrudan "GİRNE OYUNU · SONUÇ"; "Evi tekrar dene" çalışıyor; konsol hatası yok.

## Gri tema + sis/toz (Playwright, ekran görüntüsüyle)
Menü/şehir/hazırlık/deprem/artçı ekranları gri hakim; deprem ve artçıda sis-toz ve kızıl vinyet; öncü sarsıntı ve şehir→ev geçişinde harita tozu; yangın/işaretler renkli; konsol hatası yok; 3 tur → zoom → ev → ortak sonuç akışı bozulmadı.

## Ek 4 testleri (Playwright)
Yapı güvenliği oyunu 3 adımda doğru seçimle tamamlanıyor; fenersiz tahliyede `exitDark()` true ve yalnız kişi çevreleri aydınlık, fenerli çantada false; deprem başlığı görünüyor; şehir→ev geçişinde `quaking` sınıfı aktif; konsol hatası yok.

## Ek 5: tema geri alma
Menü, şehir haritası, hazırlık ve deprem ekranları eski renkli görünümle ekran görüntüsüyle kontrol edildi; konsol hatası yok.

## Ek 6 testleri (Playwright)
7 bölümde yalnız Anne+Çocuk; bölüm seçimi 7 kart; yakalama oyunu otomatik oyuncuyla tamamlanıyor (cmap'e dönüş); ses bağlamı çalışıyor (state running); şehir→ev→ortak sonuç akışı çalışıyor; konsol hatası yok.

## Ek 7 testleri (Playwright)
Yangın söndürücü oyunu gerçek fare basılı tutma + süpürme ile 100 adımda söndürüldü ve cmap'e döndü; yapı denetçisi 5 kusur tıklanınca tamamlandı; arsa sondajı sondaj + inşa ile tamamlandı; sol üst klavye paneli yok; şehir→ev→ortak sonuç akışı ve 7 bölüm sağlam; konsol hatası yok.

## Ek 8 testi
Playwright (z8): menü tek çizgi, çarşı 5 dükkân akışı, beton lab faz 1→2 tamamlanıyor; sayfa hatası yok. İnsan oyun testi ve Safari yapılmadı.
