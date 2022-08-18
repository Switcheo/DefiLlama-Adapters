const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");

async function tvl() {
  const allTokensResult =  await get("https://api-insights.carbon.network/info/defillama")
  const allTokens = allTokensResult.result
  const poolResult = await get("https://api-insights.carbon.network/pool/list?limit=100000");
  const pools = poolResult?.result?.models
  const balances = {};
  await Promise.all(
    pools.map(async (pool) => {
      const res = await get(
        `https://api.carbon.network/cosmos/bank/v1beta1/balances/${pool.address}`
      );
      res.balances.forEach((b) => {
        allTokens[b.denom] &&
          sdk.util.sumSingleBalance(
            balances,
            allTokens[b.denom].coinGeckoId,
            parseInt(b.amount) / 10 ** allTokens[b.denom].decimals
          );
      });
    })
  );

  return balances;
}

module.exports = {
  carbon: {
    tvl
  },
};
