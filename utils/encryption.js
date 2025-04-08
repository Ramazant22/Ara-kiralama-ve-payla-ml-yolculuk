const CryptoJS = require('crypto-js');
const crypto = require('crypto');

// Hassas verileri şifrelemek için kullanılacak anahtar
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'takdrive-encryption-key-2024';

// Veri şifreleme
const encrypt = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Şifreleme hatası:', error);
    return null;
  }
};

// Şifrelenmiş veriyi çözme
const decrypt = (encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Şifre çözme hatası:', error);
    return null;
  }
};

// Güvenli rastgele token oluşturma
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Telefon numarası maskeleme
const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3');
};

// E-posta maskeleme
const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  return `${maskedName}@${domain}`;
};

// Kredi kartı numarası maskeleme
const maskCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  return '*'.repeat(12) + cardNumber.slice(-4);
};

// Hash oluşturma (örn. şifre sıfırlama token'ı için)
const createHash = (data) => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  generateSecureToken,
  maskPhoneNumber,
  maskEmail,
  maskCreditCard,
  createHash
}; 