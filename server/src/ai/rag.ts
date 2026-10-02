import type { Lang, OutcomeRecord, Provider, SourceCitation, Trade } from '../domain/types.js';
import { getStore } from '../db/index.js';
import { DEMO_SOURCE } from '../data/seedData.js';

/**
 * Retrieval layer. Every trade / outcome / provider fact is pulled from the
 * seeded knowledge base — nothing is invented at query time. The counsellor
 * assembles natural-language answers from these records only.
 */

const ALIASES: Record<string, string[]> = {
  electrician: ['electrician', 'wiring', 'wireman', 'wires', 'electrical', 'electric', 'switch', 'மின்சார', 'எலக்ட்ரீஷியன்', 'வயரிங்'],
  'cnc-operator': ['cnc', 'machinist', 'machine tool', 'machine operator', 'lathe', 'milling', 'இயந்திர', 'cnc', 'லேத்'],
  'solar-pv': ['solar', 'sunlight', 'sun', 'renewable', 'panel', 'energy', 'சோலார்', 'சூரிய', 'புதுப்பிக்கத்தக்க'],
  electronics: ['electronics', 'electronic', 'circuit', 'chip', 'device', 'appliance', 'repair', 'typical', 'எலக்ட்ரானிக்ஸ்', 'சர்க்யூட்', 'மின்னணு', 'பழுது'],
  automotive: ['automotive', 'vehicle', 'car', 'bike', 'two-wheeler', 'mechanic', 'engine', 'garage', 'வாகன', 'கார்', 'வண்டி', 'மோட்டார்', 'மெக்கானிக்'],
};

const CATEGORY_WORDS = ['trade', 'course', 'career', 'job', 'learn', 'training', 'vocational', 'course', 'படிப்பு', 'தொழில்', 'வேலை', 'பயிற்சி'];

export interface RetrievedTrade {
  trade: Trade;
  score: number;
  outcome: OutcomeRecord | undefined;
  localOutcome: OutcomeRecord | undefined;
  providers: Provider[];
}

export async function retrieveTrades(
  query: string,
  districtId: string | null,
): Promise<RetrievedTrade[]> {
  const store = await getStore();
  const lower = query.toLowerCase();
  const trades = store.getTrades();

  const found = trades
    .map((trade) => {
      let score = 0;
      const aliases = ALIASES[trade.id] ?? [trade.id];
      for (const alias of aliases) {
        if (lower.includes(alias.toLowerCase())) score += 3;
      }
      for (const word of CATEGORY_WORDS) {
        if (lower.includes(word)) score += 0;
      }
      for (const role of trade.roles) {
        for (const lang of ['en', 'ta'] as Lang[]) {
          if (lower.includes(role.title[lang].toLowerCase())) score += 2;
        }
      }
      return { trade, score: score > 0 ? score : 0 };
    })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  return found.map(({ trade, score }) => {
    const outcome = store.getOutcomes(trade.id, null)[0];
    const local = districtId ? store.getOutcomes(trade.id, districtId)[0] : undefined;
    const providers = store
      .getProviders()
      .filter((p) => p.tradeIds.includes(trade.id) && (!districtId || p.districtId === districtId))
      .slice(0, 3);
    return { trade, score, outcome, localOutcome: local, providers };
  });
}

export async function topMatchTrades(districtId: string | null): Promise<RetrievedTrade[]> {
  const store = await getStore();
  return store.getTrades().map((trade) => {
    const outcome = store.getOutcomes(trade.id, null)[0];
    const local = districtId ? store.getOutcomes(trade.id, districtId)[0] : undefined;
    const providers = store
      .getProviders()
      .filter((p) => p.tradeIds.includes(trade.id) && (!districtId || p.districtId === districtId))
      .slice(0, 3);
    return { trade, score: 1, outcome, localOutcome: local, providers };
  });
}

export function demoCitation(): SourceCitation {
  return {
    name: DEMO_SOURCE.name,
    url: DEMO_SOURCE.url,
    dataPeriod: DEMO_SOURCE.dataPeriod,
    verificationStatus: 'DEMO',
    nature: 'demo',
  };
}

export function outcomeCitation(_outcome: OutcomeRecord): SourceCitation {
  return demoCitation();
}

export function inr(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function range(p25: number, p75: number): string {
  return `${inr(p25)} – ${inr(p75)}`;
}