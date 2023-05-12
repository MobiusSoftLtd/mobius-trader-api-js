const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const tradingAccountId = 1156587;

    const moneyInfo = await mt7.moneyInfo(tradingAccountId, 'BTC');

    mt7.log(moneyInfo);
  } catch (e) {
    console.error(e);
  }
})();
