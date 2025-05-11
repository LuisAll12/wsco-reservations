import fs from 'fs';
import path from 'path';

export class Logger {
  static writeLog(filePath: string, message: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFileSync(filePath, message + '\n', 'utf8');
  }

  static info(message: string) {
    const filePath = path.join(__dirname, '../log', `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.log`);
    this.writeLog(filePath, `[INFO] ${new Date().toISOString()} - ${message}`);
  }
}
