const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const { StockModel } = require('../models/StockModel');
const { PriceHistoryModel } = require('../models/PriceHistoryModel');
const mongoose = require('mongoose');

// Helper to add a small delay between batches to avoid rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const syncAllStocks = async () => {
  console.log('[Sync] Starting real-time stock sync...');
  const stocks = await StockModel.find({ active: true });
  
  if (!stocks.length) {
    console.log('[Sync] No active stocks found.');
    return { success: true, count: 0 };
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    // Suffix .NS for NSE India
    const symbolWithSuffix = `${stock.symbol}.NS`;
    
    try {
      console.log(`[Sync] Fetching data for ${symbolWithSuffix} (${i + 1}/${stocks.length})...`);
      
      // 1. Fetch current quote
      const quote = await yahooFinance.quote(symbolWithSuffix);
      
      if (quote) {
        // Update stock model with real data
        stock.latestPrice = {
          price: quote.regularMarketPrice || stock.latestPrice.price,
          previousClose: quote.regularMarketPreviousClose || stock.latestPrice.previousClose,
          change: quote.regularMarketChange || stock.latestPrice.change,
          changePercent: quote.regularMarketChangePercent || stock.latestPrice.changePercent,
          asOf: new Date(),
        };

        if (quote.marketCap) {
          stock.fundamentals = {
            ...stock.fundamentals,
            marketCap: quote.marketCap,
            peRatio: quote.trailingPE || stock.fundamentals?.peRatio,
            eps: quote.epsTrailingTwelveMonths || stock.fundamentals?.eps,
            dividendYield: quote.trailingAnnualDividendYield 
              ? quote.trailingAnnualDividendYield * 100 
              : stock.fundamentals?.dividendYield,
          };
        }
        
        await stock.save();
      }

      // 2. Fetch historical data (last 1 year to populate chart)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const queryOptions = { period1: oneYearAgo.toISOString().split('T')[0], interval: '1d' };
      const historyResult = await yahooFinance.chart(symbolWithSuffix, queryOptions);
      
      if (historyResult && historyResult.quotes && historyResult.quotes.length > 0) {
        // Prepare bulk operations for PriceHistoryModel
        const bulkOps = historyResult.quotes
          .filter(q => q.close !== null) // Ignore days with no trading data
          .map(q => {
            // Calculate previous close and change for each day based on the previous day's close
            // This is simplified; we just store the raw data Recharts needs.
            const change = q.close - q.open;
            const changePercent = (change / q.open) * 100;
            
            return {
              updateOne: {
                filter: { 
                  stockId: stock._id, 
                  interval: '1d', 
                  date: new Date(q.date) 
                },
                update: {
                  $set: {
                    symbol: stock.symbol,
                    open: q.open,
                    high: q.high,
                    low: q.low,
                    close: q.close,
                    volume: q.volume,
                    change: Number(change.toFixed(2)),
                    changePercent: Number(changePercent.toFixed(2)),
                  }
                },
                upsert: true
              }
            };
          });

        if (bulkOps.length > 0) {
          await PriceHistoryModel.bulkWrite(bulkOps, { ordered: false });
        }
      }

      successCount++;
    } catch (err) {
      console.error(`[Sync] Error fetching data for ${symbolWithSuffix}:`, err.message);
      errorCount++;
    }

    // Delay 500ms between requests to avoid rate limits
    await delay(500);
  }

  console.log(`[Sync] Completed. Success: ${successCount}, Errors: ${errorCount}`);
  return { success: true, count: successCount, errors: errorCount };
};

module.exports = {
  syncAllStocks,
};
