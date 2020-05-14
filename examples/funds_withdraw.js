const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const accountNumberId = 1156587;

  const balanceTicket = await mt7.fundsWithdraw(
    'USD',
    accountNumberId,
    1,
    'YM',
    '12345678912345');

  mt7.log(balanceTicket);
}

run();
