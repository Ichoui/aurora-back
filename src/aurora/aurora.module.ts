import { Module } from "@nestjs/common";
import { AuroraController } from "./aurora.controller";
import { AuroraService } from "./aurora.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  controllers: [AuroraController],
  providers: [
    AuroraService,
  ],
})
export class AuroraModule {}
