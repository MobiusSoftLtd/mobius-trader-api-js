const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const currencyByName = mt7.getCurrency('USD');
  mt7.log(currencyByName);

  const currencyById = mt7.getCurrency(1);
  mt7.log(currencyById);
}

run();
