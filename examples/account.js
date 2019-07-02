const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

(async () => {
  // Initialization of work with API
  await mt7.init();

  const accountId = 267987;

  try {
    // Get account info
    const info = await mt7.getAccount(accountId);

    console.log(info);
  } catch (e) {
    console.error(e);
  }
})();
