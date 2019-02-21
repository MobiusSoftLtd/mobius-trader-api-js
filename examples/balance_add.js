const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountNumberId = 1156587;

  const balanceTicket = await mt7.balanceAdd(accountNumberId, mt7.depositToInt('USD', 100), 'Add 1 USD');

  console.log(balanceTicket);
});
