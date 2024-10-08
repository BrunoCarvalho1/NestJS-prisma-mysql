import { INestApplication, Module, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Module ({
    providers: [PrismaService]
})

export class PrismaService extends PrismaClient implements OnModuleInit{
    async onModuleInit() {
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication){
        process.on('beforeExit', async () => {
          await app.close();
        });
    }
}