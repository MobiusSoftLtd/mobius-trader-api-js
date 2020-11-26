const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const email = 'test222@mobius-soft.org';
  const name = 'Test';
  const lastName = 'Account';
  const password = 'test111';
  const withdrawPassword = 'test222';
  const agentAccount = null;
  const country = 'Russia';
  const city = 'Moscow';
  const address = 'Street';
  const phone = '+791234567890';
  const zipCode = '123456';
  const state = 'Moscow';
  const comment = '';

  try {
    // Create account
    const account = await mt7.createAccount(
      email,
      name,
      agentAccount,
      country,
      city,
      address,
      phone,
      zipCode,
      state,
      comment,
      lastName
    );

/*
    // Create an account using the universal "call" method
    const account = await mt7.call('AccountCreate', {
      Name: name,
      LastName: lastName,
      Email: email,
      AgentAccount: agentAccount,
      Country: country,
      City: city,
      Phone: phone,
      State: state,
      ZipCode: zipCode,
      Address: address,
      Comment: comment,
    });
*/

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
