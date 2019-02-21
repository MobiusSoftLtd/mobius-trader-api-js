const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const email = 'test2@mobius-soft.org';
  const name = 'Test';
  const password = 'test111';

  try {
    const account = await mt7.createAccount(email, name);
    await mt7.passwordSet(account.Id, email, password);

    const accountNumber = await mt7.createAccountNumber(
      MobiusTrader.AccountNumberType.REAL,
      account.Id,
      100,
      'USD',
      'Dollar',
      ['USD']
    );

    console.log(account, accountNumber);
  } catch (e) {
    console.error(e);
  }
});
