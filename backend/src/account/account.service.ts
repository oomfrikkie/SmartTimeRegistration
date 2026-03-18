import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { AccountDto } from './dto-account/account.dto';
import { MicrosoftRegisterDto } from './dto-account/microsoft-register.dto';
import { Request } from 'express';
import 'express-session';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}


  async microsoftRegister(
    dto: MicrosoftRegisterDto,
    req: Request,
  ): Promise<{ message: string; account: AccountDto; created: boolean }> {
    if (!dto || !dto.email) {
      throw new BadRequestException('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();
    const providedName = dto.name?.trim();
    const providedSurname = dto.surname?.trim();

    const existing = await this.accountRepo.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'email', 'name', 'surname'],
    });

    if (existing) {
      if (req.session) {
        req.session.userId = existing.id.toString();
        req.session.userEmail = existing.email;
        req.session.loggedIn = true;
      }

      return {
        message: 'Microsoft account already exists. Logged in successfully.',
        account: Object.assign(new AccountDto(), {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          surname: existing.surname,
        }),
        created: false,
      };
    }

    const fallbackName = providedName || 'Microsoft';
    const fallbackSurname = providedSurname || 'User';
    const generatedPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const createdAccount = this.accountRepo.create({
      email: normalizedEmail,
      name: fallbackName,
      surname: fallbackSurname,
      password: hashedPassword,
    });

    const saved = await this.accountRepo.save(createdAccount);

    if (req.session) {
      req.session.userId = saved.id.toString();
      req.session.userEmail = saved.email;
      req.session.loggedIn = true;
    }

    return {
      message: 'Microsoft account created and logged in successfully.',
      account: Object.assign(new AccountDto(), {
        id: saved.id,
        email: saved.email,
        name: saved.name,
        surname: saved.surname,
      }),
      created: true,
    };
  }
  // Account creation
  async create(dto: CreateAccountDto): Promise<{ message: string; account: AccountDto }> {
    if (!dto || !dto.email || !dto.password) {
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
  async login(dto: LoginDto, req: Request): Promise<{ message: string; account: Partial<Account> }> {
    if (!dto || !dto.email || !dto.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    // EMAIL FORMAT CHECK
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new UnauthorizedException('Invalid email format');
    }

    const account = await this.accountRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'name', 'surname']
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, account.password);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Store user info in session
    if (req.session) {
      req.session.userId = account.id.toString();
      req.session.userEmail = account.email;
      req.session.loggedIn = true;
    }

    // Removing the password from the account object
    const { password, ...accountWithoutPassword } = account;

    return {
      message: 'Login successful',
      account: accountWithoutPassword,
    };
  }

  async findById(id: string): Promise<Partial<Account>> {
    const numericId = parseInt(id, 10);

    const account = await this.accountRepo.findOne({ 
        where: { id: numericId },
        select: ['id', 'email', 'name', 'surname'] 
    });
    
    if (!account) {
        throw new UnauthorizedException('User not found');
    }
    
    return account;
}
}