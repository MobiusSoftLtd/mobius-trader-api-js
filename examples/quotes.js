const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const symbols = ['BTCUSD', 'ETHUSD'];
  const quotes = await mt7.getQuotes(symbols);

  console.log(quotes);
});
