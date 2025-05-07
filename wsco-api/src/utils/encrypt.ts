import { randomInt } from 'crypto';
import CryptoJS from 'crypto-js';

export async function Encrypt(text: string): Promise<string> {

    const secret = process.env.ENCRYPTION_SECRET || "my_secret"; // keep this secure!
    const code = randomInt(100000, 999999).toString();
    const encrypted = CryptoJS.AES.encrypt(code, secret).toString();

    return encrypted;
}