const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountId = 267987;

  try {
    const info = await mt7.getAccount(accountId);
    console.log(info);
  } catch (e) {
    console.error(e);
  }
});
