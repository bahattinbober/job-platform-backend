import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('test-user')
  createTestUser(@Body('email') email: string) {
    return this.appService.createTestUser(email);
  }

  @Get('test-user')
  getAllUsers() {
    return this.appService.getAllUsers();
  }
}