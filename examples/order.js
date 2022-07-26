const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountNumberId = 1156587;
    const symbolId = 1;

    const orderOpen = await mt7.call('AdminOpenOrder', {
      AccountNumberId: accountNumberId,
      SymbolId: symbolId,
      Volume: mt7.volumeToInt(symbolId, 0.001),
      TradeCmd: MobiusTrader.TradeCmd.SELL,
    })

    await mt7.call('AdminModifyOrder', {
      Ticket: orderOpen.Ticket,
      Comment: `Test ${Date.now()}`,
    });

    const response = await mt7.call('AdminCloseOrder', {
      Ticket: orderOpen.Ticket,
    });

    mt7.log(orderOpen.Ticket, response);
  } catch (e) {
    console.error(e);
  }
})();
