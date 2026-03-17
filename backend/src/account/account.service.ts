import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { AccountDto } from './dto-account/account.dto';


@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  // Account creation
  async create(dto: CreateAccountDto): Promise<{ message: string; account: AccountDto }> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }

    // EMAIL FORMAT CHECK
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('Invalid email format. Must contain @ and/or .com');
    }

    const existing = await this.accountRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const newAccount = this.accountRepo.create({
      name: dto.name,
      surname: dto.surname,
      email: dto.email,
      password: hashed,
    });

    const savedAccount = await this.accountRepo.save(newAccount);
    
    return {
      message: 'Account created',
      account: Object.assign(new AccountDto(), {
        id: savedAccount.id,
        email: savedAccount.email,
        name: savedAccount.name,
        surname: savedAccount.surname,
      }),
    };
  }

  //Logging in to an existing account
  async login(dto: LoginDto): Promise<{ message: string; account: Partial<Account> }> {
    // EMAIL FORMAT CHECK
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new UnauthorizedException('Invalid email format');
    }

    const account = await this.accountRepo.findOne({
      where: { email: dto.email },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, account.password);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Removing the password from the account object
    const { password, ...accountWithoutPassword } = account;

    return {
      message: 'Login successful',
      account: accountWithoutPassword,
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const account = await this.accountRepo.findOne({
      where: { email },
    });

    // Always return same message (security)
    if (!account) {
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');

    account.resetPasswordToken = token;
    account.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min

    await this.accountRepo.save(account);

    const resetLink = `http://localhost:5173/set-new-password?token=${token}`;

    // TEMP: log instead of email
    console.log('Reset link:', resetLink);

    return {
      message: 'If this email exists, a reset link has been sent.',
    };
  }

  async setNewPassword(token: string, password: string): Promise<{ message: string }> {
    const account = await this.accountRepo.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!account || !account.resetPasswordExpires || account.resetPasswordExpires < Date.now()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashed = await bcrypt.hash(password, 10);

    account.password = hashed;
    account.resetPasswordToken = null;
    account.resetPasswordExpires = null;

    await this.accountRepo.save(account);

    return {
      message: 'Password updated successfully',
    };
  }
}