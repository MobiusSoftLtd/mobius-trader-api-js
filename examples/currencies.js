const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const currencies = mt7.getCurrencies();

  mt7.log(currencies);
}

run();
