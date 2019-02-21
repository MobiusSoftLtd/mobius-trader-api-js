const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);
mt7.init().then(() => {
  const currencyByName = mt7.getCurrency('USD');
  console.log(currencyByName);

  const currencyById = mt7.getCurrency(1);
  console.log(currencyById);
});
