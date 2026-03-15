import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
}