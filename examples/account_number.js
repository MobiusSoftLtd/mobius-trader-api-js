const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountNumberId = 1156587;

    const info = await mt7.call('AccountNumberGet', {
      Id: accountNumberId
    });

    mt7.log(info);
  } catch (e) {
    console.error(e);
  }
})();
