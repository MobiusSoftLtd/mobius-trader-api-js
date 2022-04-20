const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountId = 267987;
    const leverage = 100;
    const settingsTemplate = 'USD';
    const displayName = 'Dollar';
    const tags = ['USD'];

    const accountNumber = await mt7.createAccountNumber(
      MobiusTrader.AccountNumberType.REAL,
      accountId,
      leverage,
      settingsTemplate,
      displayName,
      tags
    );

/*
    // Create an account number using the universal "call" method
    const account = await mt7.call('AccountNumberCreate', {
      AccountId: Number(accountId),
      Leverage: Number(leverage),
      SettingsTemplate: settingsTemplate,
      DisplayName: displayName,
      Tags: tags,
      Type: MobiusTrader.AccountNumberType.REAL,
    });
*/

    mt7.log(accountNumber);
  } catch (e) {
    console.error(e);
  }
})();
