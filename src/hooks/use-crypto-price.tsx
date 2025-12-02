
async function getCryptoPrice(symbol, fallbackAddress = null) {
  // 1️⃣ Try CoinPaprika (needs their coin-id format)
  const paprikaMap = {
    btc: "btc-bitcoin",
    eth: "eth-ethereum",
    sol: "sol-solana",
    doge: "doge-dogecoin",
    ada: "ada-cardano",
  };

  try {
    if (paprikaMap[symbol]) {
      console.log("Trying CoinPaprika...");
      const price = await getPriceFromCoinPaprika(paprikaMap[symbol]);
      return { price, source: "CoinPaprika" };
    }
  } catch {}

  // 2️⃣ Try CoinGecko
  try {
    console.log("Trying CoinGecko...");
    const price = await getPriceFromCoinGecko(symbol);
    return { price, source: "CoinGecko" };
  } catch {}

  // 3️⃣ Try DexScreener (token address required)
  if (fallbackAddress) {
    try {
      console.log("Trying DexScreener...");
      const price = await getPriceFromDexScreener(fallbackAddress);
      return { price, source: "DexScreener" };
    } catch {}
  }

  throw new Error("Price could not be fetched from any source");
}

// Example:
getCryptoPrice("eth", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
  .then(result => console.log(result))
  .catch(console.error);
