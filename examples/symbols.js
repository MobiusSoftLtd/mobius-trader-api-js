const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const symbols = mt7.getSymbols();

    mt7.log('symbols', symbols);
  } catch (e) {
    console.error(e);
  }
})();
