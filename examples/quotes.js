const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    // Array of symbols
    const symbols = ['BTCUSD', 'ETHUSD'];

    // Get quotes for symbols
    const quotes = await mt7.getQuotes(symbols);

    mt7.log(quotes);
  } catch (e) {
    console.error(e);
  }
})();

/**
Response:

{
  BTCUSD: { Ask: 7897580, Bid: 7897150 },
  ETHUSD: { Ask: 245140, Bid: 245106 }
}
*/
