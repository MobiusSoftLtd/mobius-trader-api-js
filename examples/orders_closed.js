const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const response = await mt7.search(
      'AccountNumbers.CurrencyId',
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
      [mt7.expr('Profit+Commission+Swap'), 'TotalProfit']
    )
      .from(MobiusTrader.SEARCH_CONTEXT.Orders)
      .where('AccountNumberId', '=', 1)
      .andWhere('CloseTime', '>', 0)
      .andWhere('TradeCmd', 'IN', [
        MobiusTrader.TradeCmd.BUY,
        MobiusTrader.TradeCmd.SELL,
      ])
      .limit(10)
      .offset(0)
      .orderBy('Ticket', 'DESC')
      .execute();

    const orders = response.asArray();

    const ordersReal = orders.map(({
              'AccountNumbers.CurrencyId': currencyId,
              SymbolId,
              OpenPrice,
              ClosePrice,
              Profit,
              Commission,
              Volume,
              ...order
            }) => ({
        ...order,
        SymbolId,
        CurrencyId: currencyId,
        OpenPrice: mt7.priceFromInt(SymbolId, OpenPrice),
        ClosePrice: mt7.priceFromInt(SymbolId, ClosePrice),
        Profit: mt7.depositFromInt(currencyId, Profit),
        Commission: mt7.depositFromInt(currencyId, Commission),
        Volume: mt7.volumeFromInt(SymbolId, Volume),
      }));

    const tickets = response.asArray('Ticket');
    const mapByTicket = response.asMap('Ticket');
    const mapProfits = response.asMap('Ticket', 'Profit');
    const first = response.first();


    mt7.log(orders, ordersReal, tickets, mapByTicket, mapProfits, first);
  } catch (e) {
    console.error(e);
  }
})();
