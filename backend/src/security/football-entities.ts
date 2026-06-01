import COMPETITIONS_DATA from '../data/competitions.json' with { type: 'json' };
import FOOTBALL_TERMS_DATA from '../data/football_terms.json' with { type: 'json' };

export const FOOTBALL_TERMS = [...FOOTBALL_TERMS_DATA];

export const COMPETITIONS = [
  ...COMPETITIONS_DATA,
  // brasil
  'brasileirão',
  'brasileirao',
  'serie a',
  'série a',
  'serie b',
  'série b',
  'serie c',
  'serie d',
  'copa do brasil',
  'supercopa do brasil',

  // américa
  'libertadores',
  'copa libertadores',
  'sul-americana',
  'sul americana',
  'recopa sul-americana',

  // europa
  'champions league',
  'uefa champions league',
  'europa league',
  'conference league',
  'premier league',
  'la liga',
  'bundesliga',
  'serie a italiana',
  'ligue 1',
  'eredivisie',
  'primeira liga',
  'liga portugal',

  // mundial
  'copa do mundo',
  'world cup',
  'mundial de clubes',
  'club world cup',
  'intercontinental',

  // seleções
  'copa américa',
  'eurocopa',
  'euro',
  'nations league',
  'eliminatórias',
  'qualifiers',

  // base
  'copinha',
  'sul-americano sub-20',
  'mundial sub-20',

  // feminino
  'copa do mundo feminina',
  'women world cup',
];

export const FOOTBALL_TEAMS = [
  'palmeiras',
  'flamengo',
  'corinthians',
  'são paulo',
  'sao paulo',
  'santos',
  'vasco',
  'grêmio',
  'gremio',
  'internacional',
  'botafogo',
  'fortaleza',
  'ceará',
  'ceara',
  'bahia',
  'cruzeiro',
  'atlético mineiro',
  'atletico mineiro',
  'fluminense',
  'real madrid',
  'barcelona',
  'atlético madrid',
  'atletico madrid',
  'liverpool',
  'arsenal',
  'chelsea',
  'manchester city',
  'manchester united',
  'tottenham',
  'psg',
  'bayern',
  'juventus',
  'milan',
  'inter de milão',
  'inter de milao',
];
