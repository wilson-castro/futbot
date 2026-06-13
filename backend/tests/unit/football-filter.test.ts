import { analyzeFootballContext } from '../../src/security/football-filter.ts';

describe('analyzeFootballContext', () => {
  it('pontua um termo de futebol (10) mas não o considera relacionado sozinho', () => {
    const result = analyzeFootballContext('gol');
    expect(result.score).toBe(10);
    expect(result.footballRelated).toBe(false); // limiar é 20
  });

  it('considera relacionado quando dois termos somam 20', () => {
    const result = analyzeFootballContext('quem fez o gol no jogo');
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.footballRelated).toBe(true);
  });

  it('reconhece um time conhecido (peso 20)', () => {
    const result = analyzeFootballContext('o palmeiras venceu');
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.footballRelated).toBe(true);
  });

  it('reconhece competições em minúsculas (ex.: libertadores)', () => {
    const result = analyzeFootballContext('final da libertadores');
    expect(result.footballRelated).toBe(true);
  });

  it('não relaciona texto sem termos de futebol', () => {
    const result = analyzeFootballContext('qual a receita de bolo de cenoura?');
    expect(result.score).toBe(0);
    expect(result.footballRelated).toBe(false);
  });

  it('é case-insensitive na entrada', () => {
    expect(analyzeFootballContext('PALMEIRAS').footballRelated).toBe(true);
  });
});
