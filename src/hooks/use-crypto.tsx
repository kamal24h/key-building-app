
async function getPriceFromCoinPaprika(coinId = "btc-bitcoin") {
  const url = `https://api.coinpaprika.com/v1/tickers/${coinId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("CoinPaprika error");
  const data = await res.json();
  return data.quotes.USD.price;
}

// Example:
getPriceFromCoinPaprika("eth-ethereum")
  .then(price => console.log("ETH Price:", price))
  .catch(console.error);


  async function getPriceFromCoinGecko(symbol = "bitcoin") {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("CoinGecko error");
  const data = await res.json();
  return data[symbol].usd;
}

// Example:
getPriceFromCoinGecko("ethereum")
  .then(price => console.log("ETH Price:", price))
  .catch(console.error);


// async function getPriceFromDexScreener(tokenAddress, chain = "ethereum") {
//   const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
//   const res = await fetch(url);
//   if (!res.ok) throw new Error("DexScreener error");
//   const data = await res.json();

//   if (!data.pairs || data.pairs.length === 0) throw new Error("Token not found");

//   // Pick highest liquidity pair
//   const pair = data.pairs[0];
//   return pair.priceUsd;
// }

// // Example:
// getPriceFromDexScreener("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") // WETH
//   .then(price => console.log("WETH Price:", price))
//   .catch(console.error);




