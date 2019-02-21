const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountNumberId = 1156587;

  try {
    const moneyInfo = await mt7.moneyInfo(accountNumberId);
    console.log(moneyInfo);
  } catch (e) {
    console.error(e);
  }
});
