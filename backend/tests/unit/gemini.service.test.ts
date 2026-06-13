const mockSendMessage = jest.fn();
const mockCreate = jest.fn(() => ({ sendMessage: mockSendMessage }));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    chats: { create: mockCreate },
  })),
}));

import { streamFootballResponse } from '../../src/services/gemini.service.ts';

describe('streamFootballResponse', () => {
  it('invoca onToken com o texto retornado pelo chat', async () => {
    mockSendMessage.mockResolvedValueOnce({ text: 'O Palmeiras venceu por 2 a 0.' });
    const onToken = jest.fn();

    await streamFootballResponse('quem venceu?', onToken);

    expect(onToken).toHaveBeenCalledTimes(1);
    expect(onToken).toHaveBeenCalledWith('O Palmeiras venceu por 2 a 0.');
  });

  it('cria o chat com modelo, temperatura, system prompt e ferramenta de busca', async () => {
    mockSendMessage.mockResolvedValueOnce({ text: 'ok' });

    await streamFootballResponse('pergunta', jest.fn());

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const config = mockCreate.mock.calls[0][0];
    expect(config.model).toBe('gemini-test');
    expect(config.config.temperature).toBe(0.3);
    expect(config.config.systemInstruction).toContain('FutBot');
    expect(config.config.tools).toEqual([{ googleSearch: {} }]);
  });

  it('encaminha a pergunta do usuário para sendMessage', async () => {
    mockSendMessage.mockResolvedValueOnce({ text: 'ok' });

    await streamFootballResponse('minha-pergunta', jest.fn());

    expect(mockSendMessage).toHaveBeenCalledWith({ message: 'minha-pergunta' });
  });

  it('lança erro quando a resposta não tem texto', async () => {
    mockSendMessage.mockResolvedValueOnce({ text: '' });

    await expect(streamFootballResponse('q', jest.fn())).rejects.toThrow(
      'Failed to get response from chat session'
    );
  });

  it('propaga erros da API', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('quota exceeded'));
    await expect(streamFootballResponse('q', jest.fn())).rejects.toThrow('quota exceeded');
  });
});
