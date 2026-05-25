import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './features/user/user.module';
import { PrismaModule } from './features/prisma/prisma.module';
import { ProjectModule } from './features/project/project.module';

@Module({
  imports: [UserModule, PrismaModule, ProjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}