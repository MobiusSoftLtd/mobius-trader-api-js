const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const accountNumberId = 1156587;

  try {
    const info = await mt7.getAccountNumber(accountNumberId);

    mt7.log(info);
  } catch (e) {
    console.error(e);
  }
}

run();
