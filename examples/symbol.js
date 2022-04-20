const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const symbolByName = mt7.getSymbol('BTCUSD');
    mt7.log(symbolByName);

    const symbolById = mt7.getSymbol(2);
    mt7.log(symbolById);
  } catch (e) {
    console.error(e);
  }
})();
