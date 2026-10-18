# FAYT — AI değişiklik kaydı

Araç: OpenAI Codex. Kapsam: yüklenen proje üzerinde 1. etap oyun iyileştirmeleri. Yeni hazır görsel, font, ses veya kütüphane eklenmedi. Oyun saf HTML/CSS/klasik JS olarak kaldı. Önceki proje `/workspace/BuyukFelaket_backup` altında korundu.

## Görünüm

- **Görsel (CSS) — style.css:** ortak renk, boşluk, köşe, gölge ve geçiş değişkenleri eklendi; panel, düğme ve odak durumları eşleştirildi. Amaç: Girne gecesi kimliğini koruyarak arayüz bütünlüğü.
- **Görsel (CSS) — style.css:** şehir HUD'u tek satıra alındı; bütçeye ◆, tur ve açık riske belirgin sayı hiyerarşisi verildi; görev, plan, harita açıklaması ve acil uyarı yerleri ayrıldı. Acil uyarı varken harita açıklaması gizlenir. Amaç: haritayı ve eylemleri okunaklı tutmak.
- **Görsel (CSS) — style.css:** dar mahalle pencereleri 360 px genişliğe çıkarıldı, kaydırma sınırı ve okunaklı metin ölçüleri eklendi; 12 px altındaki CSS font boyutları 12 px yapıldı. Amaç: özellikle risk açıklamalarının okunması.
- **Görsel (CSS) — style.css:** menüde rekor alanına yer ayrıldı; modal üstündeki kalın şerit inceltildi; gereksiz parlamalar ve görev titremesi azaltıldı. Amaç: mevcut sismograf ve Girne siluetini öne çıkarmak.
- **Görsel (CSS) — style.css:** hastane hazırlık panosu, numaralı okul öğrencileri, sur için fare hücreleri, duraklatma, rehber, ev kontrolleri ve seçilebilir skor metni stilleri eklendi. Amaç: yeni etkileşimlerin mevcut kimlikle uyumu.
- **Görsel (Canvas) / kod — art.js:** Canvas yazı yardımcısında alt sınır 12 px; azaltılmış hareket tercihinde kamera sarsıntısı kapalı. Amaç: okunabilirlik ve hareket hassasiyeti. Diğer Canvas ortam animasyonları korunuyor.
- **Görsel (CSS) — style.css:** `focus-visible`, basılı ve devre dışı durumları; genel `prefers-reduced-motion` kuralı eklendi. Amaç: klavye görünürlüğü ve daha sakin hareketler.

- **Görsel (SVG) / kod — index.html:** sismograf motifinden küçük, kodla çizilmiş gömülü sekme simgesi eklendi. Amaç: sekme kimliği ve yerel test sunucusunda tarayıcının favicon için 404 isteğini kaldırmak. Harici kaynak yok.

## Mantık

- **Kod — city.js:** güncel olmayan satın alma basamağı, sonuç/işlem durumu ve yanlış ekran için koruma eklendi. Kanıt: eski sürümde aynı basamak iki kez çağrılınca 4 ◆ karşılığı iki kademe; yeni sürümde ikinci çağrı etkisiz.
- **Kod — city.js:** geçici su önleminin `held` bayrağı, kademe aşınması kontrolünden sonra temizleniyor. Kanıt: eski sürümde korunmuş komşu kademe 2 → 1; yeni sürümde 2 olarak kalır.
- **Kod — city.js / game.js:** şehir yıldızları ve ortak puanın şehir payı aşağıdaki fırsat normalleştirmesini kullanıyor. Deprem büyüklüğü kişi kaybı simülasyonunda kalır, şehir puanını değiştirmez.
- **Kod — game.js:** yeni puan sistemi sürüm 2 olarak saklanır. Eski kampanya rekoru `campLegacyBest` alanında korunur, menüde “Önceki sistem” diye gösterilir; yeni rekor ayrı hesaplanır. Bozuk kayıt yapıları ve sınır dışı yıldız/puanlar güvenli aralığa alınır.
- **Kod — city.js:** ilk acil risk 60 sn, sonrakiler 40 sn; mahalle penceresi, duraklatma ve görünmeyen sekmede süre işlemez. Amaç: yeni oyuncuya okuma zamanı.
- **Kod — city.js:** şehir turu ve deprem sonucu için gecikmiş işlemler başlatıldıkları kampanyayı doğrular. Amaç: eski kampanyanın yeni oyuna sonuç yazmasını önlemek.
- **Kod — city.js:** Konutlar tatbikatını bitirme işlemi tekrar çalıştırılamaz. Amaç: mükerrer ücretsiz kademe/ziyaret kaydını önlemek.
- **Kod — drills.js:** gecikmiş tatbikat eylemleri gerçek zamanlı `setTimeout` yerine tatbikat saatindeki iş kuyruğuna taşındı. Tamamlanmış veya terk edilmiş tatbikat işi başka tatbikata sızmaz; mikro oyun sonuç beklemesi de duraklar.
- **Kod — drills.js:** başarısız acil risk mikro oyunu `crisisFail` sayacına da eklenir. Amaç: sonuç istatistiğinin doğruluğu.
- **Kod — drills.js:** Su Deposu başarısı için sağlam hatların açık kalması şartı eklendi; başarılı özel sonuçlar en az 2 yıldız gösterir. Amaç: “başarılı ama 1 yıldız” çelişkisini önlemek.
- **Kod — drills.js:** Liman teknesinin kalkış işi tekilleştirildi ve kalkış anında üç yolcu tekrar doğrulanıyor. Amaç: hızlı tıklama/geri alma sonrası eksik tekne kalkışını önlemek.
- **Kod — drills.js:** Çarşı puanındaki hız çarpanı kaldırıldı; tamamlanan denetim ve yanlış hamleler belirleyici. Amaç: okuma hızını cezalandırmamak.
- **Metin / kod — game.js:** şehirden eve avantajlar korunuyor; ev başarısının Konutlar kaybına ±%25 etkisi ve %50 nötr noktası köprüde açıklandı. Ortak skor hâlâ ½ şehir + ½ ev.

### Yeni şehir puanı formülü

`t = CT.quakeTurn`, `B = 6 + 11 × (t − 1)`, `F = t`.

1. Her mahallenin nüfusu `p`, kademesi `l` için hazırlık kazanımı `p × 0,85 × l / 3`. Toplamı 10.000'e bölünür: `P`.
2. Açık riskli mahalle nüfusları için `p × 0,18 / 10.000` toplamı: `E`. Birikmiş risk kesintisi `A = min(0,15; CT.risk × 0,002)`.
3. `R(t)`: aynı `B` bütçe ve en fazla `F` ücretsiz kademe ile ulaşılabilen en yüksek nüfus ağırlıklı hazırlık. Dokuz mahalle için dinamik programlama hesaplar. Ücretsiz kademelerin en pahalı basamakları karşılayabildiği iyimser fırsat üst sınırıdır. Mikro oyun/kombo ek gelirleri referans bütçesine eklenmez; bonuslar oyuncunun hedefe yaklaşmasına yardım eder.
4. `Şehir = round(100 × clamp((P − E − A) / R(t), 0, 1))`. Yıldız eşikleri: 50 / 68 / 85.
5. Ev sonunda `YeniKonutKaybı = round(EskiKonutKaybı × (1,25 − 0,005 × EvPuanı))`.
6. `DüzeltilmişŞehir = clamp(round(Şehir + (EskiKonutKaybı − YeniKonutKaybı) / 10.000 × 100), 0, 100)`.
7. `Ortak = round((DüzeltilmişŞehir + EvPuanı) / 2)`. Ortak yıldız eşikleri: 50 / 68 / 85.

Büyüklük bu puan formülüne girmez. Kayıp sayıları bilimsel tahmin değildir; oyun modelidir. Riskler ayrıca mevcut kayıp modelinde 1,75 yerel çarpanı ve birikmiş şehir riskini korur. Rastgele mahalle/risk dağılımının oynanış etkisi sürer; tüm rastlantısallığın yok edildiği iddia edilmez.

Ölçüm: tatbikat yapmadan nüfus öncelikli yatırım stratejisinde eski şehir puanı, 3 turda büyüklük 6,5/7,5 için %97/%83; 5 turda tavan öncesi %105/%96 idi. Yeni hesapta aynı karşılaştırma 3 tur %73/%73, 4 tur %77/%77, 5 tur %81/%81. Açık Konutlar riski eklenince sırasıyla %66/%71/%76. Hiç hazırlık yapmayanın şehir puanı %0. Daha uzun oyunda ücretsiz tatbikatı kullanmamak daha fazla kullanılmamış fırsat bırakır; ölçüm stratejisi optimum değildir.

## Eklenenler

- **Kod / metin / görsel — drills.js, style.css:** Hastane, hasta triyajı ve yakıt ekleme yerine yedek güç, tüp sabitleme, güvenli değerlendirme alanı, açık koridor, cihaz sabitleme ve haberleşme planını kapsayan 50 sn'lik altı denetime dönüştü. Fare veya 1–3 ile seçim; yanlış seçimde gerekçe ve puan kesintisi. Amaç: deprem öncesi hazırlık; tıbbi tanı öğretmemek.
- **Kod / metin — drills.js:** Okul öğrencileri numaralandırıldı; 1–8 kontrolü ve tahliye sırası açıklaması eklendi. Çarşı ve Su Deposu'na Tab+Enter yönergesi, sur tatbikatına komşu hücre fare hareketi ve eylem düğmesi eklendi. Amaç: klavye/fare erişimi.
- **Kod / metin — drills.js:** Çarşı ve Su Deposu 45 sn; Liman 45 sn'lik kapasite tatbikatı olarak anlatılıyor. Su ve Liman olayları deprem öncesi örnek tatbikat olarak çerçevelendi; gerçek tahliye için yetkili yönlendirmesi hatırlatıldı.
- **Kod / metin — game.js, style.css:** geçilebilir üç adımlı ilk oyun rehberi; tercih `g72guide` içinde hata yakalamayla saklanır. Amaç: ilk dakika hedefini açıklamak.
- **Kod / metin — game.js, style.css, audio.js:** Esc duraklatma penceresi; devam, ana menü, ses; DOM durumu korunur, diğer arayüz inert olur, odak pencerede tutulur. Sekme arka plana geçince otomatik ara; işlemekte olan şehir turu tamamlanır. Ses bağlamı da durur. Amaç: süreleri güvenle durdurmak.
- **Kod / metin — game.js, style.css:** aile sahnesinde klavyeyle tehlike giderme, seçili kişiyi masalara gönderme, gaz kapama ve tahliye için açılır DOM kontrolleri. Amaç: Canvas fare eylemlerine klavye alternatifi.
- **Kod / metin — game.js:** ortak sonuçta açık risk, aile yaralanması ve çanta kararlarına göre üç ders. Amaç: oyuncunun kendi seçimlerini afet bilgisiyle ilişkilendirmek.
- **Kod / metin — game.js, style.css:** kampanya skorunu kopyalama; Clipboard API reddinde seçilebilir metin ve Ctrl+C alternatifi. Amaç: çevrimdışı, ağsız paylaşım metni.
- **Kod — city.js, drills.js, game.js, index.html:** mahalle ve etkileşimli hücreler gerçek düğmeler; mahalle/pencere/Canvas etiketleri, durum duyuruları, “nasıl oynanır” ve duraklatma odak yönetimi. Amaç: erişilebilir kontroller. Tam ekran okuyucu uyumluluğu iddiası yoktur.
- **Metin — city.js, game.js, drills.js:** risk çarpanı açıklaması, şematik harita notu, yıldız hesabı açıklaması, doğru Çök–Kapan–Tutun ifadesi ve gaz kokusunda şaltere dokunmama uyarısı eklendi/düzeltildi. Öncü sarsıntı mesajı oyun uyarısı olarak ayrıldı; gerçekte deprem zamanı öngörülemez. Haber mikro oyunundaki kurum mesajlarının kurmaca örnek olduğu yazıldı; yerel bağlamdaki “Valilik” örneği eğitim yetkilileriyle değiştirildi.
- **Ses (WebAudio) / kod — audio.js, city.js:** ana ses kazancı 0,9 → 0,55, düşük frekanslı gürültü katsayısı 1,5 → 0,75; yeni turda mevcut güvenli eylem sesi, ücretli risk kapamada mevcut önlem tamamlama sesi kullanılıyor. Ses tercihi mevcut güvenli localStorage kaydıyla sürer. Yeni harici ses/müzik eklenmedi.
- **Diğer — CHANGELOG_AI.md, TEST_SONUCLARI.md:** yapılan işleri, formülü, test kanıtını ve sınırları kaydetmek için bu iki belge oluşturuldu.
- **Diğer — /workspace/qa:** projeye bağımlılık eklemeden Playwright inceleme, simülasyon ve regresyon yardımcıları; önce/sonra ekran görüntüleri ve JSON sonuçları oluşturuldu. Bunlar oyunun çalışma dosyası değildir.

## Silinenler

- **Kod / metin — drills.js:** eski hastane hasta kategorileri `HSP`, hasta kuyruğu, sabır, yakıt ve triyaj yardımcıları kaldırıldı; yalnız eski hastane mekanizmasına bağlı referansları yeni planlama tatbikatıyla değiştirildi.
- **Kod — game.js:** sonuçtaki “Sonraki bölüm” bağlantısı devre dışı bırakıldı; kampanya dışı eski gaz/yangın senaryolarına sonuç ekranından geçiş açılmaz.
- **Diğer:** `LEVELS[3/4/6]`, `MINI_L.gas/fire`, `ctMiniHazard`, eski senaryo çizim/durum dalları ve gizli `levelsUI` bütünüyle silinmedi. Statik referans araması hâlâ veri/çizim/sonrası dalları ve test yardımcılarındaki bağlantıları gösteriyor. Normal kampanya yalnız 0/1/2/5 kullanır. İndeksleri ve ortak simülasyonu topluca yeniden yazmak teslim öncesi gereksiz risk sayıldı. Görünür akışta yangın/itfaiye oyunu eklenmedi.

## Değiştirilmeyen teslim dosyaları

`README.md`, `KAYNAKLAR.md`, mevcut fontlar/lisans, `data.js` ve `icons.js` değiştirilmedi. Mevcut `BuyukFelaket-tek-dosya.html` yeniden üretilmedi: **bu etapta güncellenen oyun `index.html` ve yanındaki kaynak dosyalarıdır**. Yeni ZIP veya tek dosya paket hazırlanmadı.


## Sonraki kullanıcı isteği — Mac indirme ve GitHub

- **Kod / diğer — OYUNU-AC.html, BuyukFelaket-tek-dosya.html:** kullanıcı bu etaptan sonra indirilebilir dosya istediği için güncel index, yedi klasik script ve iki CSS dosyası dış bağımlılıksız tek HTML'de birleştirildi. Kaynak mantığı değiştirilmedi. Menü, dokuz mahalle ve Esc duraklatma Chromium'da açıldı; sıfır konsol/pageerror ve harici istek. Mac/Safari file:// kontrolü hâlâ elle yapılmalıdır.
- **Diğer — BuyukFelaket-Mac.zip:** güncel oyun kaynakları, güncel tek HTML, mevcut lisanslar ve kısa Mac açılış talimatı paketlendi. Arşiv bütünlüğü doğrulandı. Önceki bölümdeki “tek dosya/ZIP üretilmedi” ifadesi yalnız ilk geliştirme etabına aittir; bu sonraki kullanıcı isteğiyle değişmiştir.
- **Diğer — Git:** kullanıcı açıkça GitHub'a ayrı dal yüklemesine izin verdi. main değiştirilmeden ayrı bir dal hazırlanır.

## İkinci geliştirme etabı — kararların aileye yansıması

Kullanıcının beş geliştirmeyi ekleme ve aynı GitHub dalına push talebi üzerine:

- **Görsel (SVG/CSS) / kod — city.js, style.css:** alınan kademelerle mahallede beliren kod çizimi ekipler, kontrol/sabitleme işaretleri, işaretli koridor ve küçük mahalleli hareketleri eklendi. Bu görsel katman puanı değiştirmez. Azaltılmış hareket ve duraklatma tercihlerini izler.
- **Kod / görsel — drills.js, city.js:** başarılı Afet Merkezi tatbikatının A ve B yolları, çizilen hücre dizileriyle `CT.drillProof` içinde saklanır. Şehir sonucunda gerçek iki yolun küçük çizimi gösterilir; şehir haritasında aynı hazırlığı temsil eden şematik koridor işaretlenir. Yeni kampanya tüm kanıtları sıfırlar.
- **Görsel / metin / kod — city.js, style.css:** hazırlıkların depremdeki etkisi için önce/sonra kartları eklendi: Okul dolapları/korunma tatbikatı, tahliye koridoru ve diğer yatırım basamakları. Görev olmayan bir rota tatbikatına %15 kayıp avantajı atfedilmez; bu avantaj yalnız mevcut Tahliye Koridoru görevi tamamlanınca anlatılır.
- **Kod / görsel / metin — city.js:** sarsıntı sürerken koridordaki hareket durur. Sarsıntı durduktan sonra, koridor hazırlanmışsa 1,8 saniyelik düzenli tahliye gösterimi oynar ve şehir sonucuna geçilir. Bu görsel gösterim mevcut kayıp/puan formülünü değiştirmez. Gecikmiş sonuç işi aynı kampanyaya ait olduğunu denetler.
- **Kod / metin / görsel — city.js, game.js, style.css:** Konutlar'daki Anne ve Elif'ten kısa mesajlar eklendi. İlk aile tanışması ve ikinci tur korunma mesajı; gerçekten alınmış Konutlar kademelerine, Okul kademesine ve ev tatbikatı sabitlemelerine bağlı devam mesajları. Mesajlar anahtarla tekilleştirilir; şehirden eve köprüde önceki iki mesaj hatırlatılır. Harita mesajı deniz bölgesinde kalır; ilk rehberde ve deprem gösteriminde gizlenir.
- **Kod — game.js:** dolu masaya yeni kişi atama artık reddedilir; önceki hedef/rezervasyon korunur. Yolda olan kişiler de kapasiteden sayılır. Böylece bir masa yuvasına iki kişinin üst üste yerleşmesi önlenir.
- **Görsel (Canvas/CSS) / kod / metin — art.js, game.js, style.css:** deprem/sonrası için sürekli görünen kişi ve masa kontrol paneli eklendi. Seçili kişi, “gidiyor/korunuyor”, masa başına boş yer, ayrılmış kişi adları ve Q/E kısayolları gösterilir. Canvas üzerinde ayrılmış yuvalar ve yürüyen kişilerin hedef çizgileri görünür. Dolu masa, başka kişi için devre dışıdır. Sonrasında gaz kapama ve çıkış düğmeleri de korunur.
- **Kod / metin / görsel — game.js, style.css:** şehirden hazır gelen sabitlemeler ev hazırlığında ayrı gösterilir. Sarsıntı sırasında zamanı gelen sabitlenmiş tehlikeler `R.prevented` içine kaydedilir; son iki önlemin işe yaradığı canlı mesajda görünür. Tekrar başlayan ev yeni kayıtlarla başlar.
- **Kod — game.js:** `applyEvent` içinde yalnız gerçekten artan yaralanmalar `R.impacts` kaydına alınır; zaten ağır yaralı kişiye yeni darbe yazılmaz. Kaynak nesne ve etkilenen aile üyelerinin adları saklanır.
- **Kod / metin / görsel — game.js, style.css:** kampanya sonucu artık gerçek karar ve olaylardan kişisel hikâye kurar: tamamlanan koridor, okul hazırlığı, adıyla yaralanan kişi/nesne, işe yarayan sabitleme, yaralanmadan çıkan aile üyeleri ve çıkıştaki kutular. Rastgele dramatik yaralanma yazılmaz. Evin işe yarayan veya açık kalan riskine uygun kitaplık/TV/avize/yol önce-sonra çizimi eklenir. Sonuç puanı ve üç ders korunur.
- **Görsel (CSS) — style.css:** yeni kartlar için şehir sonucu kaydırma alanı genişletildi; eve devam düğmesi ekran altında görünür kalır. Kampanya sonucuna boy sınırı ve kaydırma verildi. Tüm yeni çizimler mevcut ikon/kişi sistemi ve özgün SVG/Canvas/CSS ile üretildi.
- **Diğer — TEST_SONUCLARI.md, /workspace/qa/upgrade-tests.cjs:** ikinci etap kanıtları, sekiz yeni tarayıcı kontrolü ve ekran görüntüleri kaydedildi. Test yardımcıları oyunun bağımlılığı değildir.
- **Diğer / kod — OYUNU-AC.html, BuyukFelaket-tek-dosya.html, BuyukFelaket-Mac.zip:** güncel kaynaklardan çevrimdışı tek HTML ve Mac paketi yeniden üretildi; kaynak/dağıtım eşleşmesi ve ZIP bütünlüğü kontrol edildi. Önceki yedek korunuyor. README/KAYNAKLAR ve font/lisans dosyaları değiştirilmedi.

Bu etapta ses dosyası, font, hazır asset veya kütüphane eklenmedi; ses sentezi kodu değiştirilmedi. Skor formülü ve 3–5 tur/deprem/şehir–ev ana akışı korunur.

## Üçüncü etap — yedi mantık sorunu ve arayüz

Bu bölümdeki v3 hesapları, yukarıdaki v2 ortak skor düzeltmesinin yerini alır. Şehrin tur/bütçe referans formülü korunur.

- **Kod — city.js:** `ctFly`, kaynak mahallenin gerçek risk nesnesini taşır; gaz/elektrik riski rastgele başka türe dönüşmez. İşlem başladığı kampanyayı doğrular ve hedef zaten riskliyse tekrar risk/istatistik üretmez. Amaç: aynı ihmalin komşuda açığa çıkması kuralını korumak.
- **Kod / metin — city.js:** görev avantajları, güncel kademeden değil kazanılmış `doneMissions` kaydından okunur. Bir eylemde tamamlanan bütün görevler işlenir. Görev listesi, gelir, kayıp çarpanı, giderme indirimi ve eve taşınan görev avantajları aynı kalıcı kaydı kullanır; kademe aşınması ödülü geri almaz. Kartta “Kalıcı ödül” yazılır.
- **Kod / metin — city.js:** bekledikten sonra rastgele acil risk çıkarma kaldırıldı. Birinci turda süreli acil risk yok; ikinci/üçüncü turda bir, dördüncü/beşinci turda iki risk tur başında görünür. Uygun mahalle kalmadıysa yeni risk çıkmaz. İlk risk 60 sn, diğerleri 40 sn; açık pencere/duraklatmada sayaç durur. Hızlı tur sonu aynı risk uyarısını ve çözülmemişse sonuçlarını alır.
- **Kod / metin — city.js, drills.js, game.js:** başarılı Afet Merkezi rota tatbikatı gerçek, kalıcı ve bir kez uygulanan %5 şehir kayıp azaltması sağlar. Tahliye Koridoru görevinin %15'iyle çarpılarak birleşir (`0,95 × 0,85`); tekrar tatbikat bonusu katlamaz. Harita tahmini, gerçek kayıp hesabı ve sonuç anlatımı eşleştirildi. Bu risk azaltması şehir skoruna gizli ek puan değildir.
- **Kod / metin — game.js:** ev başarısının şehir puanı katkısı artık kayıp sayısından bağımsız `round(ŞehirTabanı + (EvPuanı − 50) × 0,04)` ve 0–100 aralığındadır. Böylece 0/50/100 ev puanı şehir puanına −2/0/+2 katkı yapar. Kişi kaybındaki ±%25 simülasyonu korunur fakat bu sayıdan puan türetilmez. Köprü açıklaması güncellendi. Kayıt sürümü 3; eski rekor “Önceki sistem” alanında korunur.
- **Kod / metin — game.js:** `startExit` ağır yaralının durumunu temizlemez ve onu yürütmez. Yürüyebilenler gerçek kişi hızında, hafif yaralanma yavaşlamasıyla çıkar; Nine için yapay asgari hızlı yürüme kaldırıldı. Aktif artçı sırasında tahliye komutu ve tahliye değerlendirme saati durur.
- **Kod / metin / görsel — game.js, style.css:** güvenli alana çıkan bir insan aile üyesi olduğunda “Güvenli alandan yardım iste” açılır. Ağır yaralıyı sivil oyuncu taşımaz. İstek gerçek çağrı/ağ isteği yapmaz; oyun içi uzman yardımını başlatır. Oyundaki 6 sn yardım beklemesi artçı geçene kadar ilerlemez, Esc ile durur. Yardımla çıkan kişinin `down` ve `hits` bilgisi silinmez; ağır yaralanma puanı korunur.
- **Kod / metin / görsel — game.js, art.js:** tahliye başladıktan sonraki 32 sn oyun değerlendirmesi sonunda ulaşamayan kişiler `stranded` olarak yardım bekler. Otomatik ayağa kalkıp çıkmaz, kampta çizilmez. Hiç kimse çıkmadıysa 72 saat çantası kullanılmış gibi anlatılmaz. Nine/Pamuk çıkamadıysa ilaç/mama başarısı yazılmaz. Kamptaki fener yalnız gerçekten ulaşan bir karakterden çizilir. Gerçek yardım ekiplerine süre veya sonuç garantisi verilmez; süreler açıkça oyun süresi diye etiketlenir.
- **Kod / metin — game.js:** sonrası puanı, gerçekten çıkan kişi oranıyla çarpılır. Kimse çıkmadıysa ev puanı en çok 35; bazıları ulaşamadıysa en çok 67. Ortak puan için sırasıyla 49/67 üst sınırı uygulanır. Formül ekranında önce ham ortak puan, sonra varsa tahliye sınırı açıkça gösterilir. Böylece iyi şehir puanı, tamamlanmamış aile tahliyesini tam başarı gibi göstermez.
- **Kod / metin — game.js:** artçı yaralanması yalnız gerçek yeni hasarda kayda girer; ağır yaralıya tekrar hasar yazılmaz. Artçı olayları kişisel hikâyede doğru sebep olarak görünür. Yardımla çıkan ve güvenli alana ulaşamayanların ayrı durumları, logu ve dersleri eklendi; herkes korunmuş gibi yanlış bir sonuç üretilmez.
- **Görsel (CSS) / metin / kod — style.css, city.js:** koyu deniz mavisi yüzeyler, turkuaz hazırlık ve sıcak sarı eylem rengi uygulandı; risk/yardım için yumuşak mercan rengi kullanıldı. Kalıcı görev sayısı, rota avantajı ve turdaki acil risk sayısı için durum şeridi eklendi. Okul etiketi görev panelinden uzaklaştırıldı (şematik harita x:24 → 29). Aile/uyarı panelleri ve masa kontrolü konumları ayarlandı; sağdaki çalışma masası görünür tutuldu.
- **Görsel / metin / kod — game.js, style.css:** ağır yaralı seçiliyken panel kişi adını ve yardım gereksinimini söyler; masa komutları devre dışıdır. Solda yardım paneli, dışarıdaki kişi sayısı ve kalan oyun tahliye süresi bulunur. Ses kodu ve harici kaynaklar değiştirilmedi.
- **Diğer — TEST_SONUCLARI.md, /workspace/qa/rule-tests.cjs:** yedi soruna yönelik 13 tarayıcı kontrolü, ekran görüntüleri ve ham sonuçlar eklendi. Kaynak oyunun çalışma bağımlılığı eklenmedi.
- **Diğer / kod — OYUNU-AC.html, BuyukFelaket-tek-dosya.html, BuyukFelaket-Mac.zip:** güncel kaynaklardan yeniden üretildi; arşiv ve tek HTML eşleşmesi doğrulandı. Kullanıcının önceki açık yetkisine dayanarak aynı GitHub dalı güncellenir; main değiştirilmez.

- **Görsel / kod — game.js, style.css:** ağır yaralı seçiliyken uygulanamayacak masa seçenekleri gizlenir, başlık güvenliğe yönelir; yardım paneli solda kalır. Amaç: yaralı durumunda sağdaki masayı ve sahneyi gereksiz örtmemek.

## 2026-10-17 — Katmanlı ses düzeni
- WebAudio ortam ve görev sesleri ayrı mikslenir. Sarsıntıya bağlı uğultu, yapı gıcırtısı, eşya titreşimi; sakin ortamda hafif hava/deniz dokusu ve hazırlıkta saat tıkırtısı eklendi.
- Avize, TV, kutu, ahşap mobilya ve sıva darbeleri farklı üretildi; sabitlenen eşya yalnızca titreşir. Cam, elektrik, gaz vanası ve yangın efektleri korundu. Gaz sesi artık yalnızca gaz senaryosunda başlar.
- Deprem sırasında müzik çekilir; deprem sonrasında düşük ortam ve seyrek döküntü sesleri kalır. Artçı mevcut şiddet eğrisini takip eder.
- Ortamı azaltan kalıcı Normal/Düşük yoğunluk seçeneği ana ekrana ve duraklatma penceresine eklendi; görev uyarıları anlaşılır kalır. Sessiz seçeneği korunur.
- Duvar saatiyle çalışan ses zamanlayıcıları kaldırıldı; ses üretimi oyun güncellemesine bağlıdır. Duraklatma ses bağlamını askıya alır, biten kaynaklar bağlantılarını bırakır. Özel ses rastgeleliği oyun rastgeleliğinden ayrıldı; kompresör, yumuşak ses geçişleri ve eşzamanlı efekt sınırı kullanıldı.
- Tüm sesler özgün kodla üretilir; harici kayıt, indirme veya yeni bağımlılık yoktur.

## 2026-10-17 — v5 ile görev süresi ve tamamlanma uyumu
- Arkadaşın gönderdiği BuyukFelaket-v5.zip referans alınarak Kontrol → Onar → Sabitle → Vana gaz görevi 18 saniyeden 30 saniyeye uzatıldı. Son doğru işlem sonucu hemen kesinleştirir; kısa sonuç bildirimi ardından haritaya dönülür.
- Sur denetimi 50 saniyelik üst sınırını korur; tüm taşların durumu ve turistlerin gerçek varışı her oyun tikinde kontrol edilir. Payandalar bitip son turist açık alana vardığı anda sonuç açılır; kalan süre tüketilmez. Yürüyen turist henüz güvenli sayılmaz.
- Düşmüş taşların payanda sayısını artırmadan görev sonunu engellemesi düzeltildi. Tüm taşlar sonuçlanmış ve tüm turistler güvenli/yaralı durumdaysa tur mevcut puanla kapanır. Düşen taş ayrı raporlanır; eksik payanda kusursuz üç yıldız ve bütçe bonusu vermez.
- Mevcut duraklatma, ses sistemi ve diğer oyun geliştirmeleri korunarak yalnız ilgili davranışlar taşındı; v5 kaynakları mevcut sürümün üzerine kopyalanmadı.

## 2026-10-17 — Kaybetme, kararların görünür etkisi ve otomatik rekor
- Şehirde üç acil krizin kaçırılması oyunu bitirir. Durum şeridinde 0/3 sayacı ve kural bulunur; ikinci kaçırmada son şans uyarısı çıkar. Sayaç süresinin dolması, çözmeden turu bitirme ve acil görev başarısızlığı aynı sayaca işler. Tek görev hatası tek başına oyunu bitirmez.
- Tahliye değerlendirmesinde aileden hiçbir insan güvenli alana çıkamazsa Game Over gösterilir; yalnız evcil hayvanın çıkması aile tahliyesi sayılmaz. Bazı kişiler çıkmışsa kayıplarla devam edilir.
- 72 saat planında su ve gıdanın ikisi de eksikse veya dışarı çıkan yaralılarla su ve ilk yardımın ikisi de eksikse oyun başarısız olur. Bu açıkça belirtilen oyun eşiğidir; ölüm/gerçek dayanma süresi tahmini değildir. Hazırlık çantasında kural görünür; sonucu atlama bu kontrolü geçersiz kılamaz.
- Game Over ekranı neden, sonraki denemede yapılabilecekler, ilgili aşamayı yeniden deneme ve menü seçeneklerini sunar. Önceki rekor silinmez; biten oyun güncellemeleri devam etmez.
- Deprem geçişinde hazırlanan ve açık riski bulunmayan ikinci/üçüncü kademe bölgeler ışıkla vurgulanır; hazırlıksız bölgeler kararır. Hazırlanan koridorda tahliye akışı görünür. Ev sarsıntısına kısa yakınlaşma ve o evin gerçek sabitleme/çıkış kararlarını anlatan bildirim eklendi. Azaltılmış hareket tercihinde yakınlaşma kapalıdır; karar bilgisi korunur.
- Oyuncuya görünen kampanya ifadeleri oyun olarak değiştirildi; kayıt anahtarları korunur. Birleşik en yüksek skor ev sonucu kesinleştiğinde otomatik kaydedilir: ayrı özet düğmesine basmak gerekmez. Düşük skor rekoru düşürmez. Ana menüde rekor görünür; tarayıcı kaydı engellenirse oturum içi kayıt sınırı belirtilir.

## 2026-10-17 — Tam ekran deprem sekansı ve boş çanta
- Önceki küçük bildirim/yakınlaşma yerine özgün Canvas ile tam ekran perspektif şehir sekansı eklendi: hareketli kamera, pencere ışıklarının kesilmesi, yapı titreşimi, toz, zemin kırılma çizgisi, sonra gerçek hazırlık kademesine bağlı ışıkların geri gelmesi ve varsa tahliye koridorunun belirmesi. Şehir sekansı 7,6 saniyedir; haritadaki mevcut tahliye/sonuç akışına bağlanır.
- İlk ev girişinde 3,8 saniyelik şehirden gerçek ev görüntüsüne kamera geçişi ve boş çanta bildirimi bulunur. Yeniden denemede bu giriş tekrarlanmaz. Ev depremi öncesinde gerçek ev görüntüsü üzerinden 4,6 saniyelik yakın plan, kararma ve toz sekansı oynar; ardından kontrol oyuncuya geçer.
- Sekanslarda oyun/görev saati ilerlemez. Enter veya Sahneyi geç düğmesi aynı sonuca bir kez geçer; Esc duraklatır, M sesi kapatır. Menüye geçmek eski sekansı ve geri çağrısını iptal eder. Azaltılmış hareket tercihinde kamera/titreşim/parçacık hareketleri kapatılır ve sekans 2,4 saniye olur.
- Tüm ev senaryoları, şehirden eve ilk giriş ve yeniden denemeler boş çanta ile başlar. Önceki free seçenekleri malzeme eklemez; su, gıda, düdük ve ilk yardım otomatik verilmez. Malzemelerin tamamı normal 5 dk maliyetle seçilip çıkarılır. Şehirden gelen süre ve fiziksel ev önlemleri korunur; yalnız çanta otomasyonu kaldırılmıştır.
- Şehir/aile mesajlarından hazır çanta vaatleri çıkarıldı; köprü ekranında tüm malzemelerin oyuncu tarafından seçileceği belirtilir. Rekor kayıtları ve Game Over kuralları korunur.
- Canvas fare girdisinde tanımsız dt ile ses güncelleme çağrısı kaldırıldı; ses yalnız ana güncelleme döngüsünde ilerler. Evde gerçek fare tıklamasıyla doğrulandı.

## 2026-10-17 — Her tur dört adımlı bağlı görev planı
- Sol panel artık her tur komşu iki mahalleyi bağlayan dört işi sürekli gösterir: saha keşfi, ana noktayı güçlendirme, komşu bağlantısını hazırlama, ortak hattı test etme. Tamamlanan adım işaretlenir, sıradaki etkinleşir; sonraki adımlar sırayı atlatmaz. Eski kalıcı şehir görevlerinin kazanılmış ödülleri korunur.
- Tur başına 30 dk ekip çalışma bütçesi vardır; bu karar süresidir, gerçek zamanlı sayaç değildir. Doğru sıra 4+8+8+4 = 24 dk sürer. İki sıralı yatırımda ayrı ayrı 1 ◆ indirim uygulanır. Haritayı incelemek ücretsizdir; sıranın dışındaki bir yatırım 12 dk ve oyun boyunca en fazla 10 puana kadar, işlem başına 2 puan yeniden planlama kaybı oluşturur. Maliyet yatırım onayından önce görünür.
- Bütçe/süre yetmiyorsa para ve kademe harcanmaz. Tatbikatla kazanılan kademe de aynı plan adımını ilerletir; başarısız hazırlık tatbikatı ekip süresi harcar. Acil görevler ve açık risk müdahaleleri sıra dışı yatırım sayılmaz, ekip süresi bitse de kullanılabilir.
- Hattın son kontrolü, o tur iki mahalleye yönelen planlanmış yayılma/kademe kaybı/yeni riskleri kaldırır; yalnız gerçekten engellenen olaylar sayılır. Haritada iki mahalle arasında hareketli yeşil bağlantı belirir. Tekrar tıklayarak ödül kazanılamaz. Erken yapılmış bir iş daha sonra yeniden kademe satın almak yerine ekip süresiyle doğrulanabilir; tam kademeli şehirler de denetim planı alır.
- Her tur kendi plan ve zaman geçmişini tutar; tamamlanmayan adımların puanı eksik kalır. Şehir skoru fiziksel hazırlığın %80'i + tur planlarının ortalama uyumunun %20'si − yeniden planlama kaybıdır. Sonuç ekranında bu hesap açıkça gösterilir. Fiziksel hazırlık referansı da tur başına iki kademe fırsatına uyarlandı; aşırı hazırlığın puan tavanında açık risk cezasını gizlemesi düzeltildi.
- Game Over, boş ev çantası, tam ekran sinematikler ve önceki en yüksek skor kayıtları korunur.

## 2026-10-17 — Görev tekrarı, boru hattı görevi ve Liman tahliyesi
Araç: Claude (Anthropic). Dosyalar: `city.js`, `drills.js`, `style.css`, `README.md`. Ses, font, harici kaynak eklenmedi.

- **Kod / metin — city.js:** Acil risk seçimi yeniden yazıldı. Eski `CRISIS` tablosu her mahalleye tek bir sabit tür/metin veriyordu; aynı anda iki acil risk aynı türden (ör. iki “söylenti”) gelebiliyor, aynı mahalle aynı metinle tekrar çıkabiliyordu. Yeni `CRISIS_POOL` beş türün her biri için 4–6 mahalle ve farklı metin içerir. `ctSpawnCrisis` her adayı tekrar cezasıyla puanlar (aynı metin > aynı anda aynı tür > bir önceki tür > daha önce görülen tür > aynı mahalle) ve en düşük puanı seçer. Geçmiş `CT.crisisHist` içinde tutulur, yeni kampanyada sıfırlanır.
- **Kod — city.js (`ctBuildOrder`):** “Bağlı görevler” planı artık önceki turlarda görev alan mahalleleri, son turda kullanılanları ve aynı ikiliyi (ters yönde bile) geri sayar; kademesi dolu mahalleyi tercih etmez. Önceki sürümde sıralı seçim aynı mahalleleri peş peşe turlarda yeniden önerebiliyordu.
- **Kod — drills.js (`drFresh`):** Mikro oyun içerikleri bu kampanyada daha önce gösterilmemiş öğelerden seçilir: yangın (6 riskli + 6 sağlam havuz), söylenti (8 resmî + 8 asılsız mesaj havuzu), tahliye yolu (7 engel + 4 ekipman), gaz (rastgele alev tuzağı + 4 yanlış hareket havuzundan 2), su (4 uygunsuz kap havuzundan 3). Havuz tükenirse en eski görülenlerden devam eder.
- **Kod / metin / görsel — drills.js, style.css, city.js:** Çok zor bulunan “Boru bağlantısı güçlendirme” (hangi 3 bağlantı kritik?) kaldırıldı. Yerine aynı tehlikeye (eski boru hattı → şebeke suyu kesilir) bağlı **“Yedek su depolama”** geldi: 3–5 kişilik ailenin 3 günlük suyu (kişi × 3 gün × 3 L) ekranda hesaplı yazar; oyuncu temiz, kapaklı kapları seçip hedef litreye ulaşır. Kapaksız kova, kimyasal bidon gibi uygunsuz kaplar −1,5 sn ceza verir. 24 sn. Tehlikenin tam çözüm düğmesi “Hattı güvene al, yedek su ayır” olarak güncellendi.
- **Kod / metin — drills.js (Liman):** Herkese yer var: 9 kişi, 3 tekne × 3 yer (önceki sürümde 10 kişi/9 yer nedeniyle bir kişi açıkta kalıyordu). Puan kaç kişinin bindiğine değil **sıra doğruluğuna** bağlıdır: yüksek öncelikli (yaralı 3, çocuk/yaşlı 2, sağlıklı 1) biri, daha düşük öncelikli birinden **sonra kalkan** teknedeyse bir sıra hatası sayılır; doğruluk = 1 − hata/karşılaştırılabilir çift; puan oranı = (doğruluk − 0,5) / 0,5. Aynı tekneye binenler eşit sayılır. Süre dolarsa bekleyenler boş yerlere sırayla bindirilir (kimse açıkta bırakılmaz) ve bu sıra hata olarak puanlanır. Sonuç ekranı sıra hatası sayısını, yaralıların ilk teknede olup olmadığını ve çocuk/yaşlıların sağlıklılardan önce kalkıp kalkmadığını gösterir. Tekne kalkınca “önce kalkan, önce kurtulur” için kalkış numarası etiketlenir; düşük öncelikli biriyle kalkan tekne için anında ipucu çıkar. Kişi bileşimi her oyunda değişir (2–3 yaralı, 1–2 çocuk, 1–2 yaşlı).
- **Metin — README.md:** Liman, boru görevi ve acil risk çeşitliliği açıklamaları güncellendi.

## 2026-10-17 (ek) — Görev tekrarı: kök neden ve varyantlar
Önceki düzeltme yalnız metin ve seçim sırasını çeşitlendirdi; oyuncu hâlâ aynı görevleri görüyordu. Kök neden: acil risk mini oyunları yalnız 5 türdü ve bir oyunda 6+ acil risk çıkar; ayrıca “bağlı görevler” panelinin 4 adım başlığı her turda aynıydı.
- **drills.js:** Her tehlike türüne iki yeni mini oyun eklendi (toplam 15 acil risk görevi): `hz:<tür>:q` 3 soruluk bilgi sorusu (tür başına 4 soruluk havuz), `hz:<tür>:o` doğru sırayı kurma (tür başına 2 senaryo). Başarı: soruda en az 2/3 doğru; sırada 4 adımın tamamı. Yanlış cevap/adım −1,5 sn.
- **city.js:** `ctPickVariant` her acil riske (ve “Önlemi kendin uygula”ya) klasik/soru/sıra varyantından birini seçer; aynı tür+varyantı ve art arda aynı mekaniği havuz tükenene kadar tekrarlamaz. `CT.varHist` yeni kampanyada sıfırlanır.
- **city.js (`ctOrderUI`):** Sol paneldeki dört adımın başlık ve açıklamaları üç set arasında tur başına döner. Mekanik ve maliyetler aynı.
- **style.css:** Soru ve sıra ekranları için stiller.

## 2026-10-17 (ek 2) — Ev bölümünde kişi seçme/komut hatası
Şikâyet: Anne–Elif–Nine evinde yalnız Anne ve Elif komut alıyordu. Kök neden (ölçüldü): (1) `makeRun0` kişileri sabit x değerlerine ±22 rastgele kayma ile doğuruyordu; “Karanlık Gece”de Anne 790, Nine 740, Elif 860 olduğundan iki kişi arası 9 px’e kadar iniyordu; (2) `hitPerson` üst üste binenlerde listedeki İLK kişiyi döndürüyordu (Anne indeks 0), bu yüzden Nine’ye tıklamanın %18’inde (72/400) Anne seçiliyordu; (3) seçili kişiye tekrar tıklamak onu yerinde oynatıp seçimi sıradaki kişiye kaydırıyordu; (4) masa bölgesinde yürüyen/duran biri varken masaya tıklamak komut yerine seçim sayılabiliyordu.
- **game.js:** `spreadPeople` doğuşta kişiler arası en az 64 px bırakır (en küçük aralık 9 → 64 px). `hitPerson` en yakın kişiyi seçer. Seçili kişiye tekrar tıklama seçimi değiştirmez. Masa/çalışma masası bölgesinde, o masaya atanmış biri varsa tıklama komut sayılır; masaya atanmamış kişi yine tıklanarak seçilebilir (`clickSelects`). Sarsıntı ve sarsıntı sonrası aşamaları aynı kuralı kullanır.

### Ek 3 — Tur sayısı 3, deprem sonrası doğrudan ev
- **city.js:** `quakeTurn` sabit 3 (3. tur bitince deprem). Deprem şehir animasyonu (`startCinema('city')`, evac yazıları) ve `cres` sonuç ekranı kaldırıldı: `ctResults(mag,true)` sonucu sessiz hesaplar, harita Konutlar mahallesine (merkezlenmiş 3,4× zoom) yakınlaşır, karartma ile `startLevel` çağrılır. Köprü ekranı (bridge) de atlanır.
- **game.js:** Ev görevi bitince bölüm sonucu yerine doğrudan ortak sonuç (`go('camp')`). Metinlerdeki "3–5 tur" ifadeleri güncellendi.
- **style.css:** `.zooming/.zoom-go/.zoom-cap/.zoom-fade` geçiş stilleri.

### Ek 4 — Gri tema, sis/toz/buğu, kızıl alarm
- **style.css / icons.js:** Tüm renkler otomatik olarak %20 doygunluğa çekildi (kırmızı tonlar korundu): arayüz gri hakim. `#cv` tuvaline gri filtre, şehir haritasına düşük doygunluk.
- **art.js:** İkinci tuval (`#cv2`) filtrelenmeyen işlevsel katman: yangın, tehlike işaretleri, seçim halkaları renkli kalır. `drawAtmos()`: ana depremde ve artçıda sarsıntı şiddetiyle artan sis/toz/buğu; ana depremden sonra yavaş çöken toz. `alarmUpdate()`: sarsıntı, artçı, yangın ve gaz anında kızıl vinyet (`#alarmfx`).
- **city.js:** Öncü sarsıntı ve ana depremde haritada toz/buğu katmanı (`ctDust`).

### Ek 4
- **Boru görevi → Yapı güvenliği:** "Eski boru hattı riski" tehlikesi "Zayıf yapı riski" oldu (çözüm: zemin etüdü + malzeme denetimi). Mini oyun `hz:su`: 3 adımda doğru arsa, doğru malzeme ve doğru proje seçimi (yanlış seçim −1,5 sn, ≥2 doğru gerekir). Bilgi sorusu ve sıralama varyantları ile acil risk metinleri yapı güvenliğine çevrildi.
- **Fenersiz tahliye:** Çantada el feneri yoksa (karanlık olmayan bölümlerde de) tahliye başlayınca ekran kararır; yalnız kişilerin bulunduğu bölgeler aydınlık görünür, yürüyüş hızı ×0,8. Sonuç metnine eklendi.
- **Ara sahneler:** Deprem başlangıcındaki ve eve varışta Enter ile geçilen sinematikler kaldırıldı; yerine 1,7 sn'lik engellemeyen "DEPREM! ÇÖK · KAPAN · TUTUN" başlığı geldi.
- **Şehirden eve geçişte** harita sallanma efekti geri geldi.
- **"Evi tekrar dene"** düğmesi kaldırıldı (ev bölümü ayrı bir bölüm değil).

### Ek 5 — Gri tema geri alındı
- **style.css, icons.js:** Gri palet ve gri filtreler (`#cv`, harita, avatar/eşya filtreleri) kaldırıldı; renk paleti ve ikonlar gri temadan önceki haline döndü. Yapı güvenliği oyunu ve deprem başlığı stilleri korundu.
- **art.js, style.css:** Deprem/artçıda sis-toz ve kızıl kenar efektleri korundu ama renkli dünyayı bozmayacak kadar hafifletildi (buğu perdesi ×0,3, toz ×0,6, kızıl kenar ×0,4).

### Ek 6
- **Yapı güvenliği oyunu (hz:su):** Çoktan seçmeli yerine uygulamalı: fareyle (ya da ← →) vinç kovasını sür, düşen DOĞRU malzemeleri (etüt, nervürlü donatı, sık etriye, temiz kum, denetim…) yakala, riskli olanlardan (deniz kumu, paslı demir, kerpiç, kaçak kat, kolon kesme…) kaç. Yakalanan her doğru malzeme sağda binaya kat ekler; kombo, parçacık, sarsıntı ve ses geri bildirimi var. Riskli malzeme bir katı yıkar. 9 kat = başarı, 34 sn.
- **Ses (audio.js):** Tüm yeni ve mevcut sesler gözden geçirildi: click/pick/fix/nope/hit/safe/win/fail/warn/impact güçlendirildi; deprem başlangıcı için `quakeStart`, inşa oyunu için `build`/`bad`, acil durum alarmı çift tonlu siren. Her sahnede sürekli çalan, düşük seviyeli “karanlık siren” arka planı eklendi (alçak drone + yavaş süpüren siren + yankı + nabız); sahneye göre seviyesi değişir, Ses: Kapalı ve Yoğunluk: Düşük ayarlarına uyar.
- **Karakterler:** “Elif” adı kaldırıldı (kız çocuk “Çocuk”). Evden Nine ve Pamuk çıkarıldı; tüm ev bölümlerinde yalnız Anne ve çocuk var. “Mama + kap” eşyası kaldırıldı; “Üç Kuşak” → “Artçı Sarsıntı”, “Patili Aile” → “Ağır Hasar”.
- **Giriş ekranı:** Ortalanmış, aynalı simetrik tasarım: sol yarısı sağa aynalanan Girne silueti, ortada dev ay ve atan merkez halkaları, iki yandan aynalı sismograf izi, yan sütunlar ve köşe çerçeveleri.

### Ek 7
- **Süreler:** Tüm mini oyun süreleri +10 sn; acil risk uyarı süresi 40→50 sn (ilk uyarı 60→70 sn).
- **Yangın sıralama oyunu yerine görsel oyun:** `hz:yangin:o` artık "Yangın söndürücü atölyesi": şalteri indir → söndürücüyü al → pimi çek → alevin TABANINA basılı tutup sağa-sola süpür. Elektrik açıkken sıkmak çarpılma cezası verir; tepeye sıkmak işe yaramaz; elektrik kesilmezse alev büyür.
- **Yapı güvenliği (hz:su) çoktan seçmeli varyantları oyuna çevrildi:** `hz:su:q` "Yapı denetçisi" (röntgen merceğiyle gizli kusurları bul, sağlam elemanlara dokunma) ve `hz:su:o` "Arsa sondajı" (8 sondajla zemini tara, sağlam zemine inşa et; dere, dolgu, gevşek kum ve fay hattından kaçın). Ana oyun (vinç kovasıyla malzeme yakalama) aynı kaldı.
- **Ev ekranı:** Hazırlık aşamasındaki sol üst "Klavye ile ev kontrolleri" bölümü kaldırıldı.

## Ek 8
- Açılış sismografı: iki üst üste binen çizgi yerine tek, simetrik, deterministik iz (soldan sağa çizilir, 9 sn'de tekrar).
- Çarşı "Dükkân güvenlik turu": 18 küçük nokta yerine 5 dükkân, her birinde 3 büyük kart; tehlikeli olana tıkla, düzeltme çubuğu dolar. 4/5 düzeltme = başarı.
- Hastane ek binası "kaliteli beton": yakalama oyunu yerine Beton laboratuvarı (kum seç, çimento/su ayarla, dayanım ≥88 sabit tut, sonra vibratörle hava boşluklarını sıkıştır).

- Zoom geçişinde (deprem→ev) harita üstü ikonlar/rozetler/vatandaşlar/fay çizgisi gizlendi; sadece harita yakınlaşır.
- Zoom sırasında yalnız Konutlar ikonu (halka + pill) kalır; diğer her şey gizli.
- Arka plandaki siren kaldırıldı; yerine yarım ses çatışan alçak gerilim katmanı + seyrek Beethoven 5. Senfoni motifi (menü, hazırlık, harita, tatbikat, deprem sonrası; WebAudio sentezi).
- Tur sonunda ortada 2 sn "N. TUR BİTTİ / N+1. tur başlıyor" bildirimi; sonra yeni tur başlar.
- Ekip süresi (dk) ve sıralı "bağlı görevler" sistemi kaldırıldı. Mahalleler yine 3 kademe: bütçe (◆) ile Uygula ya da ücretsiz tatbikat (turda 1 kez); hiçbiri olmazsa turu elle bitir.
- Oyun sonu (genel sonuç) yeniden düzenlendi: üstte yıldız/skor, şehir istatistikleri, mahalle bazında kayıp tablosu (Konutlar ev etkisiyle), evdeki kişilerin durumu, dersler.
- Hata düzeltmesi: yangın söndürücü oyununun .fx kök sınıfı, diğer oyunlardaki ".fx" (düzeltildi) kartlarını üst üste bindiriyordu → .fxroot olarak yeniden adlandırıldı. Tatbikat başlığı uzun adlarda taşmaz.
- Afet çantası tüm bölümlerde 9 slot. Oyun sonu ekranına "Artçı uyarısı" notu eklendi.
- Çanta 8 slot. Sonuç ekranında büyük sayı "TOPLAM SKOR" etiketi aldı; en yüksek skor küçük ayrı satırda.
- Haritadaki kademe gösteren çalışan/işçi ikonları kaldırıldı; kademe mahalle etiketinin altında 3 yuvarlak nokta olarak görünür.
- Sonuç kayıp tablosunda yeşil renk açıklandı: renk kayıp oranına göre (yeşil ≤%10, sarı ≤%25, kırmızı üstü), her satırda yüzde yazıyor, üstte renk açıklaması var.
- Zoom sırasında sabit kalan kesik çizgili hazırlanmış rota katmanı (#cityLife) gizlendi.
