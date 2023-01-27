const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const response = await mt7.search(
      'Ticket',
      'OpenTime',
      'OpenTime',
      'TradeCmd',
      'Volume',
      'OpenPrice',
      'ClosePrice',
      'SymbolId',
      'Profit',
      'Commission',
      'Swap',
    )
      .from(MobiusTrader.SEARCH_CONTEXT.Orders)
      .where('AccountNumberId', '=', 487252)
      .andWhere('CloseTime', '>', 0)
      .andWhere('TradeCmd', 'IN', [
        MobiusTrader.TradeCmd.BUY,
        MobiusTrader.TradeCmd.SELL,
      ])
      .limit(1)
      .offset(0)
      .orderBy('Ticket', 'DESC')
      .floatMode(true)
      .execute();

    const orders = response.asArray();

    mt7.log(orders);
  } catch (e) {
    console.error(e);
  }
})();
