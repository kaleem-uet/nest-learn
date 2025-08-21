import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHello(): string {
    return 'Hello World!';
  }
  getGoodbye(): string {
    return 'Goodbye World!';
  }
  getGreeting(name: string): string {
    return `Hello, ${name}!`;
  }
}
