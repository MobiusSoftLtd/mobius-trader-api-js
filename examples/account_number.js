
const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountNumberId = 1156587;

  try {
    const info = await mt7.getAccountNumber(accountNumberId);
    console.log(info);
  } catch (e) {
    console.error(e);
  }
});
