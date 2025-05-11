import fs from 'fs';
import path from 'path';

class Logger {
    private getLogFile(): string {
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');
        const logFileName = `${formattedDate}.log`;
        return path.join(__dirname, '../log', logFileName);
    }

    private writeLog(level: string, message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}\n`;
        const logFile = this.getLogFile();
        fs.appendFileSync(logFile, logMessage, 'utf8');
    }

    info(message: string): void {
        this.writeLog('INFO', message);
    }

    warn(message: string): void {
        this.writeLog('WARN', message);
    }

    error(message: string): void {
        this.writeLog('ERROR', message);
    }
}

export default new Logger();