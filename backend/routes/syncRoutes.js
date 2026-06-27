const express = require('express');
const { syncAllStocks } = require('../services/stockSyncService');

const syncRoutes = express.Router();

syncRoutes.post('/sync/stocks', async (req, res) => {
  try {
    // Start sync in background so we don't block the HTTP response
    // (It takes a minute to fetch 30-50 stocks sequentially)
    syncAllStocks().catch(err => console.error('Background sync failed:', err));
    
    return res.json({ 
      message: 'Stock sync initiated in the background. Real data will populate shortly.' 
    });
  } catch (error) {
    console.error('Failed to trigger sync:', error);
    return res.status(500).json({ message: 'Unable to trigger sync.' });
  }
});

module.exports = { syncRoutes };
