import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiProduces,
  ApiOkResponse,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { AccountService } from './account.service';
import { AccountDto } from './dto-account/account.dto';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { MicrosoftRegisterDto } from './dto-account/microsoft-register.dto';
import 'express-session';
import { ForgotPasswordDto } from './dto-account/forgot-password.dto';
import { SetNewPasswordDto } from './dto-account/set-new-password.dto';
import { ChangePasswordDto } from './dto-account/change-password.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({
    type: CreateAccountDto,
    description: 'Register account',
    required: true,
  })
  @ApiOkResponse({ type: AccountDto })
  @Post('register')
  async create(
    @Body() dto: CreateAccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.accountService.create(dto);

    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('account', result));
    }

    return res.json(result);
  }

  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({ type: LoginDto, description: 'Login', required: true })
  @ApiOkResponse({ description: 'Login successful' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const loginResult = await this.accountService.login(dto, req);

      // Check if client wants XML
      if (
        req.headers.accept &&
        req.headers.accept.includes('application/xml')
      ) {
        res.set('Content-Type', 'application/xml');

        return res.send(
          js2xmlparser.parse('response', {
            message: loginResult.message,
            account: loginResult.account,
          }),
        );
      }

      // Return JSON with the actual login result
      return res.json(loginResult);
    } catch (error) {
      // Handle errors
      if (
        req.headers.accept &&
        req.headers.accept.includes('application/xml')
      ) {
        res.set('Content-Type', 'application/xml');
        res.status(error.status || 401);

        return res.send(
          js2xmlparser.parse('error', {
            message: error.message || 'Login failed',
          }),
        );
      }

      throw error;
    }
  }

  @ApiConsumes('application/json')
  @ApiBody({
    type: MicrosoftRegisterDto,
    description: 'Register/login with Microsoft account',
    required: true,
  })
  @Post('microsoft-register')
  @HttpCode(HttpStatus.OK)
  async microsoftRegister(
    @Body() dto: MicrosoftRegisterDto,
    @Req() req: Request,
  ) {
    return this.accountService.microsoftRegister(dto, req);
  }

  // Add a new endpoint to check if user is logged in
  @Get('profile')
  async getProfile(@Req() req: Request) {
    if (!req.session.userId) {
      throw new UnauthorizedException('Not logged in');
    }

    const account = await this.accountService.findById(req.session.userId);
    return account;
  }

  // Add logout endpoint
  @Post('logout')
  async logout(@Req() req: Request) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          throw new InternalServerErrorException('Could not logout');
        }
        resolve({ message: 'Logged out successfully' });
      });
    });
  }

  // Add reset password endpoint
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.accountService.forgotPassword(dto.email);
  }

  // Add set new password endpoint
  @Post('set-new-password')
  @HttpCode(HttpStatus.OK)
  async setNewPassword(@Body() dto: SetNewPasswordDto) {
    return this.accountService.setNewPassword(dto.token, dto.password);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    if (!req.session.userId) {
      throw new UnauthorizedException('Not logged in');
    }
    return this.accountService.changePassword(
      req.session.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
