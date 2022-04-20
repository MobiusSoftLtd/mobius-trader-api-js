const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountNumberId = 1156587;

    const balanceTicket = await mt7.balanceAdd(
      accountNumberId,
      mt7.depositToInt('USD', 100),
      'Add 1 USD'
    );

    mt7.log(balanceTicket);
  } catch (e) {
    console.error(e);
  }
})();

