import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Account } from '../account/account.entity';

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

	async generateJwt(account: Account) {
		const payload = { 
			sub: account.id, 
			email: account.email,
			name: account.name,
			surname: account.surname
		};
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
