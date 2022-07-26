const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountNumberId = 1156587;

    const {Ticket} = await mt7.call('BalanceAdd', {
      AccountNumberId: accountNumberId,
      Amount: mt7.depositToInt('USD', 100),
      Comment: 'Add 1 USD',
    });

    mt7.log(Ticket);
  } catch (e) {
    console.error(e);
  }
})();

