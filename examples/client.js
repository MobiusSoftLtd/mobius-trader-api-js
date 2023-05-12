const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const clientId = 267987;

    // Get an client info
    const info = await mt7.call('ClientGet', {
      Id: clientId
    });

    mt7.log(info);
  } catch (e) {
    console.error(e);
  }
})();
