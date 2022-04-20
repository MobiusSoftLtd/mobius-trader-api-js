const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    // Trader password
    const email = 'test2@mobius-soft.org';
    const traderPassword = 'test111';


    try {
      const right = await mt7.traderPasswordCheck(email, traderPassword);
      mt7.log('Trader: Right', right);
    } catch (e) {
      mt7.log('Trader: Wrong', e);
    }

    // Withdraw password
    const accountId = 123;
    const withdrawPassword = 'test222';

    try {
      const right = await mt7.withdrawPasswordCheck(accountId, withdrawPassword);
      mt7.log('Withdraw: Right', right);
    } catch (e) {
      mt7.log('Withdraw: Wrong', e);
    }
  } catch (e) {
    console.error(e);
  }
})();
