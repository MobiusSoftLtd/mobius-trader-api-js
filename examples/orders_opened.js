const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const orders = (await mt7.searchArray([
      'AccountNumbers.CurrencyId',
      'Ticket',
      'OpenTime',
      'OpenTime',
      'TradeCmd',
      'Volume',
      'OpenPrice',
      'SymbolId',
      'Profit',
      'Commission',
      'Swap',
    ])
      .from(MobiusTrader.SEARCH_CONTEXT.Orders)
      .where('AccountNumberId', '=', 1)
      .andWhere('CloseTime', '=', 0)
      .andWhere('TradeCmd', 'IN', [
        MobiusTrader.TradeCmd.BUY,
        MobiusTrader.TradeCmd.SELL,
      ])
      .limit(10)
      .offset(0)
      .orderBy('Ticket', 'DESC')
      .execute())
      .asArray()
      .map(({
              'AccountNumbers.CurrencyId': currencyId,
              SymbolId,
              OpenPrice,
              Profit,
              Commission,
              Volume,
              ...order
            }) => ({
        ...order,
        SymbolId,
        CurrencyId: currencyId,
        OpenPrice: mt7.priceFromInt(SymbolId, OpenPrice),
        Profit: mt7.depositFromInt(currencyId, Profit),
        Commission: mt7.depositFromInt(currencyId, Commission),
        Volume: mt7.volumeFromInt(SymbolId, Volume),
      }));

    mt7.log(orders);
  } catch (e) {
    console.error(e);
  }
})();
