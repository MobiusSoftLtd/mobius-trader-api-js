const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const accountNumberId = 1156587;

  try {
    const moneyInfo = await mt7.moneyInfo(accountNumberId);

    mt7.log(moneyInfo);
  } catch (e) {
    console.error(e);
  }
}

run();
