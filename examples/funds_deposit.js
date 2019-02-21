const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountNumberId = 1156587;

  const balanceTicket = await mt7.fundsDeposit('USD', accountNumberId, 1, 'YM', '12345678912345');

  console.log(balanceTicket);
});
