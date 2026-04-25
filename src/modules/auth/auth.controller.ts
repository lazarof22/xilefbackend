import { Controller, Get, Post, Body, Request, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(
    @Body() createAuthDto: CreateAuthDto,
  ) {
    return this.authService.register(createAuthDto);
  }

   @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

}