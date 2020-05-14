const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const accountId = 267987;

  try {
    // Get an account info
    const info = await mt7.getAccount(accountId);

    mt7.log(info);
  } catch (e) {
    console.error(e);
  }
}

run();
