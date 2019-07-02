
const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

(async () => {
  // Initialization of work with API
  await mt7.init();

  const accountNumberId = 1156587;

  try {
    const info = await mt7.getAccountNumber(accountNumberId);
    console.log(info);
  } catch (e) {
    console.error(e);
  }
})();
