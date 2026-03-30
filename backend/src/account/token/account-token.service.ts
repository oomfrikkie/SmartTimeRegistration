import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountToken } from './account-token.entity';
import { Account } from '../account.entity';
import { CreateAccountTokenDto } from './dto-token/create-account-token.dto';
import { AccountTokenResponseDto } from './dto-token/account-token-response.dto';

@Injectable()
export class AccountTokenService {
	constructor(
		@InjectRepository(AccountToken)
		private readonly tokenRepo: Repository<AccountToken>,
	) {}

	async createTokenFromDto(dto: CreateAccountTokenDto, account: Account): Promise<AccountTokenResponseDto> {
		const accountToken = this.tokenRepo.create({
			account,
			token: dto.token,
			token_type: dto.token_type,
			expires_at: dto.expires_at,
			is_used: false,
		});
		const saved = await this.tokenRepo.save(accountToken);
		return this.toResponseDto(saved);
	}

	async findByToken(token: string): Promise<AccountTokenResponseDto | undefined> {
		const entity = await this.tokenRepo.findOne({ where: { token }, relations: ['account'] });
		return entity ? this.toResponseDto(entity) : undefined;
	}

	async markAsUsed(token: string): Promise<void> {
		const entity = await this.tokenRepo.findOne({ where: { token }, relations: ['account'] });
		if (entity) {
			entity.is_used = true;
			entity.used_at = new Date();
			await this.tokenRepo.save(entity);
		}
	}

	toResponseDto(entity: AccountToken): AccountTokenResponseDto {
		return {
			token_id: entity.token_id,
			token: entity.token,
			token_type: entity.token_type,
			expires_at: entity.expires_at,
			is_used: entity.is_used,
			used_at: entity.used_at,
			accountId: entity.account?.id,
		};
	}
}
