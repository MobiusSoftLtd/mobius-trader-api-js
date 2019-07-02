const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const email = 'test222@mobius-soft.org';
  const name = 'Test';
  const password = 'test111';
  const withdrawPassword = 'test222';

  try {
    // Create account
    const account = await mt7.createAccount(email, name);

    // Set trader password
    await mt7.passwordSet(account.Id, email, password);

    // Set a password for withdrawal
    await mt7.withdrawPasswordSet(account.Id, withdrawPassword);

    console.log(account);
  } catch (e) {
    console.error(e);
  }
});
