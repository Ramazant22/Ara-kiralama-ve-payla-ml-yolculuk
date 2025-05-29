# Contributing to CarSharing App

Bu projeye katkıda bulunmak istediğiniz için teşekkürler! 🚗

## Geliştirme Ortamı Kurulumu

### Gereksinimler
- Node.js (v16 veya üzeri)
- MongoDB (v5.0 veya üzeri)
- Git
- React Native CLI (mobil geliştirme için)

### Kurulum
1. Repository'yi fork edin
2. Fork'unuzu clone edin:
```bash
git clone https://github.com/KULLANICI-ADINIZ/carsharing-app.git
cd carsharing-app
```

3. Tüm bağımlılıkları yükleyin:
```bash
npm run install:all
```

4. Environment variables'ları ayarlayın:
   - `backend/.env` dosyası oluşturun
   - Gerekli değişkenleri ekleyin (örnek için `backend/.env.example`'a bakın)

5. MongoDB'yi başlatın

6. Uygulamayı çalıştırın:
```bash
npm run dev
```

## Katkı Süreci

1. **Issue Oluşturun**: Önce bir issue oluşturun ve ne üzerinde çalışacağınızı açıklayın
2. **Branch Oluşturun**: `git checkout -b feature/yeni-ozellik` veya `git checkout -b fix/bug-fix`
3. **Kod Yazın**: Değişikliklerinizi yapın
4. **Test Edin**: Kodunuzun çalıştığından emin olun
5. **Commit Edin**: Anlamlı commit mesajları yazın
6. **Pull Request Oluşturun**: Değişikliklerinizi açıklayan bir PR oluşturun

## Kod Standartları

### JavaScript/React
- ESLint ve Prettier kullanın
- Functional components tercih edin
- TypeScript kullanımını artırmaya çalışın

### Commit Mesajları
```
type(scope): description

Examples:
feat(auth): add login functionality
fix(booking): resolve date validation issue
docs(readme): update installation guide
```

### Branch İsimlendirme
- `feature/feature-name` - Yeni özellikler için
- `fix/bug-description` - Bug fix'ler için
- `docs/update-description` - Dokümantasyon güncellemeleri için
- `refactor/component-name` - Refactoring için

## Test Yazma

- Yeni özellikler için test yazın
- Mevcut testlerin geçtiğinden emin olun
- Backend için Jest, frontend için React Testing Library kullanın

## Documentation

- Yeni API endpoint'leri için dokümantasyon ekleyin
- README'yi güncel tutun
- Kod içi yorumları Türkçe yazın

## Pull Request İncelemeleri

Pull request'iniz şunları içermelidir:
- [ ] Değişikliklerin açıklaması
- [ ] İlgili issue'nun linkı
- [ ] Test edilmiş kod
- [ ] Güncellenmiş dokümantasyon (gerekirse)

## İletişim

- Issues üzerinden sorularınızı sorabilirsiniz
- Email: [proje-email@example.com]

## Code of Conduct

Bu projede herkes saygılı ve yapıcı bir şekilde iletişim kurmalıdır. Ayrımcılık, taciz veya saygısızlık tolere edilmez. 