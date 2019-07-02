const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

(async () => {
  // Initialization of work with API
  await mt7.init();

  const accountId = 267987;
  const currency = 'USD';

  try {
    const balance = await mt7.getAccountBalance(accountId, currency);
    console.log(`${balance} ${currency}`);
  } catch (e) {
    console.error(e);
  }
})();
