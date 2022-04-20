const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountId = 267987;
    const currency = 'USD';

    const balance = await mt7.getAccountBalance(accountId, currency);

    mt7.log(`${balance} ${currency}`);
  } catch (e) {
    console.error(e);
  }
})();

