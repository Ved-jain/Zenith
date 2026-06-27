const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = typeof YahooFinance === 'function' ? new YahooFinance() : YahooFinance;

async function test() {
  try {
    const quote = await yahooFinance.quote('RELIANCE.NS');
    console.log('Quote:', quote.regularMarketPrice);
    
    // get history from Jan 1 2026
    const queryOptions = { period1: '2026-01-01' };
    const history = await yahooFinance.historical('RELIANCE.NS', queryOptions);
    console.log('History length:', history.length);
  } catch (err) {
    console.error(err);
  }
}
test();
