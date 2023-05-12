const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const clientId = 267987;

    const tradingAccounts = await mt7.call('TradingAccountsGet', {
      Id: clientId
    });

    mt7.log(tradingAccounts);
  } catch (e) {
    console.error(e);
  }
})();
