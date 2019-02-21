
const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountNumberId = 1156587;
  const symbolId = 1;

  try {

    let order = await mt7.orderOpen(
      accountNumberId,
      symbolId,
      mt7.volumeToInt(symbolId, 0.001),
      MobiusTrader.TradeCmd.SELL
    );

    order = await mt7.orderModify(order.Ticket, {
      Comment: 'Test ' + Date.now(),
    });

    const response = await mt7.orderClose(order.Ticket);

    console.log(order, response);
  } catch (e) {
    console.error(e);
  }
});
