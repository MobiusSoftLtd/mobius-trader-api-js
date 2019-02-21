const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountId = 267987;

  try {
    const accountNumbers = await mt7.getAccountNumbers(accountId);
    console.log(accountNumbers);
  } catch (e) {
    console.error(e);
  }
});
