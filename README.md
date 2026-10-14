# SİNEFES DEMO 🍿👑

**Sinefes Demo**, kişisel film ve dizi takip platformu Sinefes'in ziyaretçilere birebir aynı canlı deneyimi sunan, tamamen tarayıcı oturumunda (`sessionStorage`) çalışan ve veritabanı kirliliği bırakmayan interaktif demo sürümüdür.

---

## 🌟 Öne Çıkan Özellikler

1. **Sıfır Veritabanı & %100 Oturum İzolasyonu (sessionStorage)**:
   - Supabase veya harici hiçbir veritabanı kullanılmaz.
   - Tüm ekleme, silme, puanlama ve not alma işlemleri ziyaretçinin kendi sekmesindeki `sessionStorage` üzerinde gerçekleşir.
   - Sekme kapatıldığında veya yeni gizli sekmede açıldığında oturum baştan başlar; ziyaretçiler birbirinin verilerini asla görmez.

2. **Zengin Başlangıç Havuzu (15 Film + 15 Dizi)**:
   - Ziyaretçi ilk girdiğinde boş ekran görmez; IMDb puanı yüksek ve popüler **30 seçkin yapım** hazır olarak listelenir (Dune 2, Oppenheimer, Interstellar, The Dark Knight, Inception, Breaking Bad, Severance, Arcane, Succession vb.).
   - Orijinal esprili puanlama skalası (1: 💀 Elektrik Ziyanlığı, 2: 🥱 Meh, 3: 🍿 Çıtır Çerez, 4: 🔥 Fena Sardı, 5: 👑 Şaheser), izleme durumları (`watched`, `watchlist`, `waiting_season`), TMDB afişleri ve süre/sezon bilgileri eksiksizdir.

3. **Canlı TMDB Arama & "Nerede İzlenir?" Entegrasyonu**:
   - Ortadaki `+` butonuyla dünyanın herhangi bir film/dizisi canlı aranabilir ve arşive eklenebilir.
   - Detay panelinde JustWatch TR ve TV Networks verileriyle canlı yayın platformları (Netflix, BluTV, Disney+, GAİN, Prime Video vb.) listelenir.

4. **Engellemesiz Giriş**:
   - PIN ekranında tek tıkla çalışan **"✨ Canlı Demoya Gir (Misafir Girişi)"** butonuyla doğrudan içeri girilebilir. Dileyenler için `110795` PIN kodu da geçerlidir.

5. **Masaüstü Mobile-First Rozeti**:
   - Mobil (PWA) öncelikli tasarlandığı için masaüstünden bakan ziyaretçilere ekranın sağ üst köşesinde zarif bir rozet gösterilir (`📱 Mobil (PWA) deneyimi için tasarlanmıştır`).

---

## 🚀 Kurulum ve Yerel Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev

# Üretim derlemesi (Production Build)
npm run build
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

---

## ☁️ Vercel Dağıtımı

Projeyi Vercel'e aktarırken aşağıdaki ortam değişkenlerini ekleyebilirsiniz:

| Değişken | Açıklama | Varsayılan |
| :--- | :--- | :--- |
| `TMDB_API_KEY` | TMDB v3 API Anahtarı | Hazır demo anahtarı |
| `APP_PIN` | Güvenlik PIN kodu | `110795` |
