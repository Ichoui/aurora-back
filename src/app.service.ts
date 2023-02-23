import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  auroraPath(): string {
    return 'Hello Aurora Chasers!';
  }

  getTest(str: string): string {
    return str;
  }
}
