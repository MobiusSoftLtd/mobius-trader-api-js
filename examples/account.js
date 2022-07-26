const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountId = 267987;

    // Get an account info
    const info = await mt7.call('AccountGet', {
      Id: accountId
    });

    mt7.log(info);
  } catch (e) {
    console.error(e);
  }
})();
