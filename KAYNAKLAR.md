# Kaynak ve AI Beyanı — FAYT · Girne Kampanyası

Jam kuralları madde 5.2 için beş kategorinin hepsi iki tabloda cevaplanmıştır.

## 1. Hazır kaynak beyanı
| Kategori | Durum | Kaynak / lisans açıklaması |
|---|---|---|
| Görsel | **Kullanılmadı** | Tüm görseller (ev, karakterler, şehir haritası, ikonlar, arayüz) kodla, Canvas 2D ve satır içi SVG ile çizilir. Hazır görsel/ikon paketi yok. |
| Ses | **Kullanılmadı (dosya olarak)** | Ses dosyası yoktur; tüm sesler Web Audio API ile çalışma anında sentezlenir. Bazı sahnelerde duyulan 4 notalık "ta-ta-ta-taam" motifi Beethoven'ın 5. Senfonisi'nden esinlenmiştir; eser kamu malıdır (1808) ve kayıt değil, kodla üretilmiş sentez olarak çalınır. |
| Kod | **Kullanılmadı** | Dış kütüphane / framework yok; saf HTML + CSS + JavaScript. |
| Metin | **Kullanılmadı** | Dış metin kaynağı yok; oyun metinleri ekip yönlendirmesiyle AI desteğiyle yazıldı (bkz. AI beyanı). |
| Diğer | **Kullanıldı** | Yazı tipleri: **Barlow** ve **Barlow Condensed**, Barlow Project Authors, SIL Open Font License 1.1 (lisans metni: `FONT-LICENSE-OFL.txt`). @fontsource üzerinden alındı, `fonts.css` içine base64 olarak gömüldü. |

## 2. AI beyanı
| Kategori | Durum | Araç | Amaç ve kullanım yeri |
|---|---|---|---|
| Görsel | **Kullanıldı** | Claude (Anthropic); OpenAI Codex (projenin ilk etabı, bkz. `CHANGELOG_AI.md`) | Ev sahnesi, karakter ve eşya çizimleri, Girne haritası, ikon seti ve arayüz tasarımı için Canvas/SVG kodunun yazılması. Hazır görsel üretici (resim modeli) kullanılmadı; görseller AI'ın yazdığı kodla çizilir. |
| Ses | **Kullanıldı** | Claude (Anthropic); OpenAI Codex (projenin ilk etabı, bkz. `CHANGELOG_AI.md`) | Web Audio ile ses efektlerinin, arka plan gerilim katmanının ve Beethoven 5. motifi sentezinin kodlanması. Ses dosyası/AI ses modeli kullanılmadı. |
| Kod | **Kullanıldı** | Claude (Anthropic), Claude Code; OpenAI Codex (ilk etap) | Oyun mantığının tamamı: ev (deprem) senaryoları, şehir kampanyası, mahalle tatbikatları ve mini oyunlar, puanlama, test betikleri. |
| Metin | **Kullanıldı** | Claude (Anthropic); OpenAI Codex (projenin ilk etabı, bkz. `CHANGELOG_AI.md`) | Afet bilgileri, görev, ipucu ve arayüz metinleri; yönlendirme ve son kontrol ekipte. |
| Diğer | **Kullanılmadı** | — | — |

## 3. İçerik doğruluğu
Afet bilgileri (acil durum çantası, 72 saat su, Çök–Kapan–Tutun, eşya sabitleme, gaz vanası, elektrik şalteri, söndürücü, artçı sarsıntı vb.) genel sivil savunma tavsiyelerine dayanır ve AI desteğiyle yazılmıştır; resmî kılavuz yerine geçmez. Girne haritası ve nüfus dağılımı kurgusaldır. Oyunda acil durum telefon numarası yoktur.

## 4. Teslim notu
Çalıştırma talimatı ve kontroller için `README.md`; forma yapıştırılacak hazır metinler için `TESLIM-BILGILERI.md`.
