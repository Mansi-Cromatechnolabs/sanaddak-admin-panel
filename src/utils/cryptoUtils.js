import CryptoJS from 'crypto-js';

const secretKeyHex = process.env.NEXT_PUBLIC_SECRET_KEY;
const ivHex = process.env.NEXT_PUBLIC_IV_KEY;
const key = CryptoJS.enc.Hex.parse(secretKeyHex);
const iv = CryptoJS.enc.Hex.parse(ivHex);

export function encryptAES(plainText) {
  return CryptoJS.AES.encrypt(plainText, key, { iv }).ciphertext.toString(CryptoJS.enc.Hex);
}

export function decryptAES(encryptedText) {
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Hex.parse(encryptedText) },
    key,
    { iv }
  ).toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}
