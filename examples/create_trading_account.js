const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const clientId = 267987;
    const leverage = 100;
    const settingsTemplate = 'USD';
    const displayName = 'Dollar';
    const tags = ['USD'];

    const tradingAccount = await mt7.call('TradingAccountCreate', {
      ClientId: clientId,
      Leverage: leverage,
      SettingsTemplate: settingsTemplate,
      DisplayName: displayName,
      Tags: tags,
      Type: MobiusTrader.TradingAccountType.REAL,
    })

    mt7.log(tradingAccount);
  } catch (e) {
    console.error(e);
  }
})();
