const axios = require('axios');
const config = require('../config');

class AIService {
    constructor() {
        this.openaiApiKey = config.OPENAI_API_KEY;
        this.openaiBaseUrl = 'https://openrouter.ai/api/v1';
        this.chatModel = config.AI_MODELS.CHAT_MODEL;
    }

    // Ana chatbot fonksiyonu
    async chatWithAI(userMessage, context = {}) {
        try {
            console.log('AI Chat Request:', { userMessage, context, model: this.chatModel });
            
            const response = await axios.post(`${this.openaiBaseUrl}/chat/completions`, {
                model: this.chatModel,
                messages: [
                    { 
                        role: 'system', 
                        content: `Sen TakDrive platformunun Türk AI asistanısın. 

                        ÇOK ÖNEMLİ: Sadece Türkçe konuş! İngilizce yasak! 
                        
                        Platform: TakDrive (Türkiye)
                        Dil: Sadece Türkçe
                        Görev: Araç kiralama ve yolculuk paylaşımı yardımı
                        
                        KURALLARIN:
                        1. Her cevabı Türkçe ver
                        2. İngilizce kelime kullanma  
                        3. "TakDrive AI asistanıyım" de
                        4. Türk kullanıcılara yardım et
                        5. Daha detaylı ve yararlı bilgiler ver
                        6. Kullanıcıya önerilerde bulun
                        
                        Özellikler:
                        - Türkçe dil desteği mükemmel
                        - Araç kiralama konusunda uzman
                        - Yolculuk paylaşımı bilgileri
                        - Güvenlik tavsiyeleri
                        - Fiyat karşılaştırmaları
                        
                        Örnek yanıt: "Merhaba! Ben TakDrive AI asistanıyım. Size nasıl yardımcı olabilirim?"` 
                    },
                    { 
                        role: 'user', 
                        content: `Merhaba, ben Türkçe konuşan bir kullanıcıyım. Lütfen bana sadece Türkçe yanıt ver. İngilizce konuşma.` 
                    },
                    { 
                        role: 'assistant', 
                        content: `Merhaba! Ben TakDrive AI asistanıyım. Size Türkçe olarak yardımcı olabilirim. Ne yapabilirim?` 
                    },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 400,
                temperature: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('AI Response:', response.data);

            const aiResponse = response.data.choices[0].message.content;
            const turkishResponse = this.ensureTurkishResponse(aiResponse, userMessage);

            return {
                success: true,
                message: turkishResponse,
                suggestions: this.extractSuggestions(turkishResponse, context)
            };
        } catch (error) {
            console.error('AI Chat Error Details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            
            return {
                success: false,
                message: 'Üzgünüm, şu anda size yardımcı olamıyorum. Lütfen daha sonra tekrar deneyin.',
                error: error.message
            };
        }
    }

    // Araç/yolculuk önerilerini çıkarma
    extractSuggestions(aiResponse, context) {
        const suggestions = [];
        
        // AI yanıtı araç ile ilgiliyse ve sistemde araç varsa
        const vehicleKeywords = ['araç', 'araba', 'kiralama', 'rent', 'toyota', 'renault', 'bmw', 'volkswagen', 'ford'];
        const rideKeywords = ['yolculuk', 'seyahat', 'paylaşım', 'istanbul', 'ankara', 'izmir', 'gitmek', 'ulaşım'];
        
        const lowerResponse = aiResponse.toLowerCase();
        
        // Araç önerisi göster
        if (vehicleKeywords.some(keyword => lowerResponse.includes(keyword)) && 
            context.vehicles && context.vehicles.length > 0) {
            // İlk birkaç aracı öneri olarak ekle
            context.vehicles.slice(0, 2).forEach(vehicle => {
                suggestions.push({
                    type: 'vehicle',
                    id: vehicle._id,
                    action: 'view_vehicle',
                    title: `${vehicle.make} ${vehicle.model}`,
                    price: `${vehicle.pricePerDay}₺/gün`
                });
            });
        }
        
        // Yolculuk önerisi göster
        if (rideKeywords.some(keyword => lowerResponse.includes(keyword)) && 
            context.rides && context.rides.length > 0) {
            // İlk birkaç yolculuğu öneri olarak ekle
            context.rides.slice(0, 2).forEach(ride => {
                suggestions.push({
                    type: 'ride',
                    id: ride._id,
                    action: 'view_ride',
                    title: `${ride.from.city} → ${ride.to.city}`,
                    price: `${ride.pricePerSeat}₺/kişi`
                });
            });
        }
        
        return suggestions;
    }

    // Sistem prompt'u oluşturma
    buildSystemPrompt(context) {
        const basePrompt = `Sen TakDrive platformunun resmi AI asistanısın. 

ÖNEMLİ: SADECE TÜRKÇE YANIT VER! ASLA İNGİLİZCE KONUŞMA!

PLATFORM KURALLARI:
- Platform adı: "TakDrive" (başka isim kullanma!)
- Kendini "TakDrive AI asistanı" olarak tanıt
- Türkiye'nin araç kiralama ve yolculuk paylaşımı platformu
- SADECE Türkçe konuş, İngilizce kelime kullanma

DİL KURALLARI:
- Her cevabı Türkçe ver
- İngilizce cevap verme
- Türk kullanıcılarla Türkçe iletişim kur
- Samimi ama profesyonel Türkçe kullan

YASAKLAR:
- İngilizce yanıt verme
- "Could you", "Please", "Hello" gibi İngilizce kelimeler
- VEHICLE_ID, RIDE_ID kodları gösterme
- Platform ismini yanlış söyleme

İLK MESAJIN: "Merhaba! Ben TakDrive AI asistanıyım. Size Türkçe olarak yardımcı olabilirim."`;

        // Mevcut araçlar varsa ekle
        if (context.vehicles && context.vehicles.length > 0) {
            const vehicleCount = context.vehicles.length;
            const avgPrice = Math.round(context.vehicles.reduce((sum, v) => sum + parseFloat(v.pricePerDay || 0), 0) / vehicleCount);
            
            return basePrompt + `\n\nTakDrive'da ${vehicleCount} araç var. Ortalama günlük fiyat ${avgPrice}₺. Kullanıcıya Türkçe yardım et.`;
        }

        // Mevcut yolculuklar varsa ekle
        if (context.rides && context.rides.length > 0) {
            const rideCount = context.rides.length;
            const avgPrice = Math.round(context.rides.reduce((sum, r) => sum + parseFloat(r.pricePerSeat || 0), 0) / rideCount);
            
            return basePrompt + `\n\nTakDrive'da ${rideCount} yolculuk var. Ortalama kişi başı ${avgPrice}₺. Kullanıcıya Türkçe yardım et.`;
        }

        return basePrompt;
    }

    // Yazım hatası düzeltme
    async correctText(text, type = 'general') {
        try {
            let prompt = '';
            
            switch (type) {
                case 'vehicle_brand':
                    prompt = `Bu araç markasını düzelt ve standart hale getir. Sadece düzeltilmiş metni döndür:\n"${text}"`;
                    break;
                case 'vehicle_model':
                    prompt = `Bu araç modelini düzelt ve standart hale getir. Sadece düzeltilmiş metni döndür:\n"${text}"`;
                    break;
                case 'city':
                    prompt = `Bu şehir adını düzelt ve standart hale getir. Sadece düzeltilmiş metni döndür:\n"${text}"`;
                    break;
                case 'description':
                    prompt = `Bu açıklamayı dil bilgisi ve yazım kurallarına göre düzelt. Sadece düzeltilmiş metni döndür:\n"${text}"`;
                    break;
                default:
                    prompt = `Bu metni düzelt ve iyileştir. Sadece düzeltilmiş metni döndür:\n"${text}"`;
            }

            const response = await axios.post(`${this.openaiBaseUrl}/chat/completions`, {
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 100,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const correctedText = response.data.choices[0].message.content.trim();
            
            return {
                success: true,
                original: text,
                corrected: correctedText,
                changed: text !== correctedText
            };
        } catch (error) {
            console.error('Text Correction Error:', error.response?.data || error.message);
            return {
                success: false,
                original: text,
                corrected: text,
                changed: false,
                error: error.message
            };
        }
    }

    // Kullanıcı puanına göre scoring
    calculateUserScore(user) {
        let score = 50; // Base score

        // Kayıt tarihi (eski kullanıcılar daha güvenilir)
        const accountAgeMonths = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
        score += Math.min(accountAgeMonths * 2, 20);

        // Ortalama rating
        if (user.rating && user.rating.average) {
            score += (user.rating.average - 3) * 10; // 3 üzeri her puan için +10
        }

        // Tamamlanan rezervasyon sayısı
        if (user.completedBookings) {
            score += Math.min(user.completedBookings * 2, 30);
        }

        // Profil tamamlanma oranı
        let profileCompleteness = 0;
        if (user.avatar) profileCompleteness += 20;
        if (user.phone) profileCompleteness += 20;
        if (user.bio) profileCompleteness += 10;
        
        score += profileCompleteness;

        return Math.min(Math.max(score, 0), 100); // 0-100 arası sınırla
    }

    // SEO dostu başlık önerme
    async generateSEOTitle(itemType, data) {
        try {
            let prompt = '';
            
            if (itemType === 'vehicle') {
                prompt = `Bu araç için SEO dostu bir başlık oluştur (max 60 karakter):
Marka: ${data.make}
Model: ${data.model}
Yıl: ${data.year}
Şehir: ${data.location?.city}
Fiyat: ${data.pricePerDay}₺/gün`;
            } else if (itemType === 'ride') {
                prompt = `Bu yolculuk için SEO dostu bir başlık oluştur (max 60 karakter):
Başlangıç: ${data.from?.city}
Bitiş: ${data.to?.city}
Tarih: ${new Date(data.departureDate).toLocaleDateString('tr-TR')}
Fiyat: ${data.pricePerSeat}₺/kişi`;
            }

            const response = await axios.post(`${this.openaiBaseUrl}/chat/completions`, {
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 80,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                title: response.data.choices[0].message.content.trim()
            };
        } catch (error) {
            console.error('SEO Title Generation Error:', error);
            return {
                success: false,
                title: null
            };
        }
    }

    // Türkçe yanıt garantisi
    ensureTurkishResponse(aiResponse, userMessage) {
        // İngilizce kelimeler tespit et
        const englishWords = ['hello', 'please', 'provide', 'would', 'like', 'analyze', 'content', 'understand', 'request', 'response', 'example', 'could', 'ask', 'summarize', 'identify', 'translate', 'check', 'generate', 'ready', 'when'];
        const lowerResponse = aiResponse.toLowerCase();
        
        // Eğer İngilizce kelimeler varsa, Türkçe alternatif ver
        const hasEnglishWords = englishWords.some(word => lowerResponse.includes(word));
        
        if (hasEnglishWords) {
            // Basit Türkçe fallback yanıtları
            if (userMessage === '.' || userMessage.trim().length < 3) {
                return 'Merhaba! Ben TakDrive AI asistanıyım. Size nasıl yardımcı olabilirim? Araç kiralama veya yolculuk paylaşımı hakkında soru sorabilirsiniz.';
            }
            
            if (userMessage.toLowerCase().includes('araç')) {
                return 'TakDrive\'da araç kiralama konusunda size yardımcı olabilirim. Hangi şehirde ve ne zaman araç kiralamak istiyorsunuz?';
            }
            
            if (userMessage.toLowerCase().includes('yolculuk')) {
                return 'Yolculuk paylaşımı konusunda size yardımcı olabilirim. Nereden nereye seyahat etmeyi planlıyorsunuz?';
            }
            
            return 'Merhaba! Ben TakDrive AI asistanıyım. Size Türkçe olarak yardımcı olabilirim. Ne hakkında bilgi almak istiyorsunuz?';
        }
        
        return aiResponse;
    }
}

module.exports = new AIService(); 