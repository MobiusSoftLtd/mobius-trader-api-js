const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);
mt7.init().then(() => {
  const symbolByName = mt7.getSymbol('BTCUSD');
  console.log(symbolByName);

  const symbolById = mt7.getSymbol(2);
  console.log(symbolById);
});
