const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const accountId = 267987;

  try {
    const accountNumbers = await mt7.getAccountNumbers(accountId);

    mt7.log(accountNumbers);
  } catch (e) {
    console.error(e);
  }
}

run();
