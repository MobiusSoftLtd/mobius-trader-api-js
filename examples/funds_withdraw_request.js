const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const response = await mt7.call('FundsWithdrawRequest', {
      TradingAccount: 1000,
      Provider:  'Bank',
      Params: {
        Phone: '+79876655443'
      },
      Amount: 10000,
      WithdrawPassword: '_password_',
    });

    console.log(response);

  } catch (e) {
    console.error(e);
  }
})();
