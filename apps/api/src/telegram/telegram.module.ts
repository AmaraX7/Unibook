// telegram.module.ts
import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';

import { ChatbotModule } from '../chatbot/chatbot.module'; // ← añadir

@Module({
  imports: [ChatbotModule], 
  providers: [TelegramService],
})
export class TelegramModule {}