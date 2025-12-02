// ==========================
// TYPES
// ==========================
interface PriceResult {
  price: number;
  source: string;
}

type Fetcher = () => Promise<number>;

// ==========================
// SIMPLE IN-MEMORY CACHE
// ==========================
const cache = new Map<string, { price: number; expires: number }>();
const CACHE_TTL_MS = 30_000; // cache for 30 seconds

function setCache(key: string, price: number) {
  cache.set(key, { price, expires: Date.now() + CACHE_TTL_MS });
}

function getCache(key: string): number | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.price;
}

// ==========================
// RETRY WRAPPER
// ==========================
async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 300): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  throw lastError;
}

// ==========================
// API FETCHERS
// ==========================
async function getPriceFromCoinPaprika(coinId: string): Promise<number> {
  const url = `https://api.coinpaprika.com/v1/tickers/${coinId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("CoinPaprika failed");
  const data = await res.json();
  return data.quotes.USD.price;
}

async function getPriceFromCoinGecko(symbol: string): Promise<number> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("CoinGecko failed");
  const data = await res.json();
  return data[symbol]?.usd;
}

async function getPriceFromDexScreener(address: string): Promise<number> {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("DexScreener failed");
  const data = await res.json();

  if (!data.pairs || data.pairs.length === 0) throw new Error("Token not found on DexScreener");

  // choose highest-liquidity pair
  return data.pairs[0].priceUsd;
}

// ==========================
// FALLBACK WRAPPER
// ==========================
const paprikaMap: Record<string, string> = {
  btc: "btc-bitcoin",
  eth: "eth-ethereum",
  sol: "sol-solana",
  doge: "doge-dogecoin",
  ada: "ada-cardano",
};

export async function getCryptoPrice(
  symbol: string,
  fallbackAddress?: string
): Promise<PriceResult> {
  const key = symbol.toLowerCase();
  
  // 1️⃣ Check cache
  const cached = getCache(key);
  if (cached !== null) {
    return { price: cached, source: "CACHE" };
  }

  // Build list of fetchers (in priority order)
  const fetchers: { name: string; fn: Fetcher }[] = [];

  // CoinPaprika supports mapped coin-ids only
  if (paprikaMap[key]) {
    fetchers.push({
      name: "CoinPaprika",
      fn: () => retry(() => getPriceFromCoinPaprika(paprikaMap[key]))
    });
  }

  // CoinGecko
  fetchers.push({
    name: "CoinGecko",
    fn: () => retry(() => getPriceFromCoinGecko(key))
  });

  // DexScreener (needs token address)
  if (fallbackAddress) {
    fetchers.push({
      name: "DexScreener",
      fn: () => retry(() => getPriceFromDexScreener(fallbackAddress))
    });
  }

  // Execute fallback logic
  for (const { name, fn } of fetchers) {
    try {
      const price = await fn();
      if (!price) throw new Error("Invalid price response");
      setCache(key, price);
      return { price, source: name };
    } catch {
      // try next
    }
  }

  throw new Error("All API providers failed");
}

// ==========================
// EXAMPLE USAGE
// ==========================
(async () => {
  try {
    const result = await getCryptoPrice(
      "eth",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH as fallback
    );
    console.log(result);
  } catch (e) {
    console.error("Failed:", e);
  }
})();
