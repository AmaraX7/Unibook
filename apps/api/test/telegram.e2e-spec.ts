import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../src/telegram/telegram.service';
import { ChatbotService } from '../src/chatbot/chatbot.service';

const mockLaunch = jest.fn();
const mockOn = jest.fn();

jest.mock('telegraf', () => ({
  Telegraf: jest.fn().mockImplementation(() => ({
    launch: mockLaunch,
    on: mockOn,
  })),
}));

describe('TelegramService', () => {
  let service: TelegramService;

  const mockChatbotService = {
    chat: jest.fn().mockResolvedValue('Respuesta de prueba'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-bot-token'),
            get: jest.fn().mockReturnValue('development'),
          },
        },
        {
          provide: ChatbotService,
          useValue: mockChatbotService,
        },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('no debería lanzar el bot en entorno development', () => {
    service.onModuleInit();
    expect(mockLaunch).not.toHaveBeenCalled();
  });

  it('debería lanzar el bot en entorno production', () => {
    // Sobreescribimos el mock para simular producción
    jest.spyOn(service['configService'], 'get').mockReturnValue('production');
    service.onModuleInit();
    expect(mockLaunch).toHaveBeenCalled();
  });
});