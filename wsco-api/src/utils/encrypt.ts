import CryptoJS from 'crypto-js';

export async function Encrypt(text: string): Promise<string> {

    const secret = process.env.ENCRYPTION_SECRET || "my_secret"; // keep this secure!
    const encrypted = CryptoJS.AES.encrypt(text, secret).toString();

    return encrypted;
}