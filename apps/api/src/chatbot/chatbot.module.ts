// chatbot.module.ts
import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ClinicsModule } from '../clinics/clinics.module'; 
import { VisitsModule } from '../visits/visits.module';     

@Module({
  imports: [ClinicsModule, VisitsModule],            
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}