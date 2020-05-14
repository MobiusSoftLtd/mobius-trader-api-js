const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

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

    mt7.log(accountNumber);
  } catch (e) {
    console.error(e);
  }
}

run();
