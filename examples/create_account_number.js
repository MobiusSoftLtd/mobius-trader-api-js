const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountId = 267987;
  const leverage = 100;
  const settingsTemplate = 'USD';
  const displayName = 'Dollar';
  const tags = ['USD'];

  try {
    const accountNumber = await mt7.createAccountNumber(
      MobiusTrader.AccountNumberType.REAL,
      accountId,
      leverage,
      settingsTemplate,
      displayName,
      tags
    );

    console.log(accountNumber);
  } catch (e) {
    console.error(e);
  }
});
