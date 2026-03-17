import { Controller, Post, Body, Get, Param, Req, Res } from '@nestjs/common';
import { ApiProduces, ApiOkResponse, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { AccountService } from './account.service';
import { AccountDto } from './dto-account/account.dto';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { ResetPasswordDto } from './dto-account/reset-password.dto';
import { SetNewPasswordDto } from './dto-account/set-new-password.dto';

@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
    ) {}

    @ApiProduces('application/xml', 'application/json')
    @ApiConsumes('application/xml', 'application/json')
    @ApiBody({ type: CreateAccountDto, description: 'Register account', required: true })
    @ApiOkResponse({ type: AccountDto })
    @Post('register')
    async create(@Body() dto: CreateAccountDto, @Req() req: Request, @Res() res: Response) {
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
    @ApiOkResponse({ type: LoginDto })
    @Post('login')
    async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
        try {
            const loginResult = await this.accountService.login(dto);
            
            // Check if client wants XML
            if (req.headers.accept && req.headers.accept.includes('application/xml')) {
                res.set('Content-Type', 'application/xml');

                return res.send(js2xmlparser.parse('response', {
                    message: loginResult.message,
                    account: loginResult.account
                }));
            }
            
            // Return JSON with the actual login result
            return res.json(loginResult);
            
        } catch (error) {
            // Handle errors
            if (req.headers.accept && req.headers.accept.includes('application/xml')) {
                res.set('Content-Type', 'application/xml');
                res.status(error.status || 401);
                
                return res.send(js2xmlparser.parse('error', {
                    message: error.message || 'Login failed'
                }));
            }

            throw error; // Let NestJS handle JSON errors
        }
    }

    @ApiBody({
        type: ResetPasswordDto,
        description: 'Request password reset',
        required: true,
    })
    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.accountService.requestPasswordReset(dto.email);
    }

    @ApiBody({
        type: SetNewPasswordDto,
        description: 'Set new password using token',
        required: true,
    })
    @Post('set-new-password')
    async setNewPassword(@Body() dto: SetNewPasswordDto) {
        return this.accountService.setNewPassword(
        dto.token,
        dto.password,
        );
    }
}
