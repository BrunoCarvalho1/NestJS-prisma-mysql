import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "@prisma/client";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    private issuer = 'login';
    private audience = 'users';

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly userService: UserService
    ) {}

    createToken(user:User) {
        return {
            accessToken: this.jwtService.sign({
                sub: user.id,
                name: user.id,
                email: user.id,
            }, {
                expiresIn: "7 days",
                subject: String(user.id),
                issuer: this.issuer,
                audience: this.audience,
                notBefore: Math.ceil((Date.now() + 1000 * 60 * 60) / 1000)
            })
        }
    }

    checkToken(token: string) {
        try{
            const data = this.jwtService.verify(token, {
                issuer: this.issuer,
                audience: this.audience,
            });
            return data;
        } catch (e) {
            throw new BadRequestException (e);
        }
    }

    async isValidToken(token:string){
        try{
            this.checkToken(token);
            return true;
        } catch (e) {
            return false
        }
    }

    async login(email: string, password: string) {

        const user = await this.prisma.user.findFirst({
            where: {
                email, 
            }
        })
        if (!user) {
            throw new UnauthorizedException('Email e/ou senha incorretos.');
        }

        if(!await bcrypt.compare(password, user.password)){
            throw new UnauthorizedException('Email e/ou senha incorretos.');
        }

        return this.createToken(user);
    }

    async forget(email :string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!user) {
            throw new UnauthorizedException('Email está incorreto.');
        }

        //TO DO: Enviar o e-mail...

        return true;
    }

    async reset(password:string, token: string) {
        try{
            const data:any = this.jwtService.verify(token, {
                issuer: 'forget',
                audience: 'users',
            });
            if(isNaN(Number(data.id))){
                throw new BadRequestException("Token é inválido.")
            }

            const id = 0;
        const user = await this.prisma.user.update({
            where: {
                id: Number(data.id),
            },
            data: {
                password,
            }
        });
        return this.createToken(user);
        } catch (e) {
            throw new BadRequestException (e);
        }
    }
    async register(data: AuthRegisterDTO){
        const user = await this.userService.create(data);
        return this.createToken(user);

    }
}