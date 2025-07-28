import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginController } from './contexts/login/login.controller';
import { LoginService } from './contexts/login/login.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [LoginController],
  providers: [JwtStrategy, LoginService],
  exports: [PassportModule],
})
export class AuthModule {}
