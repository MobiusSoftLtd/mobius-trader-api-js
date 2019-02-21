const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(() => {
  const symbols = mt7.getSymbols();
  console.log(symbols);
});
