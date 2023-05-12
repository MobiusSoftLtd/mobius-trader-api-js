const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const clientId = 267987;
    const currency = 'USD';

    const balance = await mt7.getClientBalance(clientId, currency);

    mt7.log(`${balance} ${currency}`);
  } catch (e) {
    console.error(e);
  }
})();

