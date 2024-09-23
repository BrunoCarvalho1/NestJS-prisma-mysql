import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthService } from "./auth.service";
import { FIleModule } from "src/file/file.module";

@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET
    }),
    forwardRef(() => UserModule),
    PrismaModule,
    FIleModule
],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {

}