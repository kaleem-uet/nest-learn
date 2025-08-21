import { Controller, Get, Param, Query } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('hello')
export class HelloController {
  // Controller methods will be defined here in the future
  constructor(private readonly helloService: HelloService) {}
  // Example method to use the service
  @Get()
  getHello(): string {
    return this.helloService.getHello();
  }

  @Get('goodbye')
  getGoodbye(): string {
    return this.helloService.getGoodbye();
  }
  @Get('greet/:name')
  getGreeting(@Param('name') name: string): string {
    return this.helloService.getGreeting(name);
  }
  @Get('query')
  getQueryGreeting(@Query('name') name: string): string {
    return this.helloService.getGreeting(name);
  }
}
