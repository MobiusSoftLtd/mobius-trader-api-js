const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

(async () => {
  // Initialization of work with API
  await mt7.init();

  // Array of symbols
  const symbols = ['BTCUSD', 'ETHUSD'];

  // Get quotes for symbols
  const quotes = await mt7.getQuotes(symbols);

  console.log(quotes);
})();

/**
Response:

{
  BTCUSD: { Ask: 7897580, Bid: 7897150 },
  ETHUSD: { Ask: 245140, Bid: 245106 }
}
*/
