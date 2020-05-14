const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

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

    mt7.log(account);
  } catch (e) {
    console.error(e);
  }
}

run();
