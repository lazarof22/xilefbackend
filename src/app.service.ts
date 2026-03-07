import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getXILEF(): string {
    return 'XILEF';
  }
}
