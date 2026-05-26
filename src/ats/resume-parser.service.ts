import { Injectable, Logger } from '@nestjs/common';
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  async parsePdfBuffer(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (error) {
      this.logger.error('Error parsing PDF buffer', error);
      return '';
    }
  }
}
