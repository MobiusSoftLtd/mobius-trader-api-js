const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const symbols = mt7.getSymbols();

  mt7.log('symbols', symbols);
}

run();
