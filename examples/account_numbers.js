const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountId = 267987;

    const accountNumbers = await mt7.call('AccountNumbersGet', {
      Id: accountId
    });

    mt7.log(accountNumbers);
  } catch (e) {
    console.error(e);
  }
})();
