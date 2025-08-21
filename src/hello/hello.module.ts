import { Module } from '@nestjs/common';
import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';

@Module({
  controllers: [HelloController],
  providers: [HelloService],
  exports: [HelloService], // Exporting HelloService for use in other modules
})
export class HelloModule {}
