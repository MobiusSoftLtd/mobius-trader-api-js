const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);
mt7.init().then(() => {
  const currencies = mt7.getCurrencies();
  console.log(currencies);
});
