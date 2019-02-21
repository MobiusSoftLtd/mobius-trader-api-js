const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);
mt7.init().then(() => {
  mt7.searchArray([
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
    .from(mt7.fromOrders())
    .where('AccountNumberId', '=', 1)
    .andWhere('CloseTime', '=', 0)
    .andWhere('TradeCmd', 'IN', [
      MobiusTrader.TradeCmd.BUY,
      MobiusTrader.TradeCmd.SELL,
    ])
    .limit(10)
    .offset(0)
    .orderBy('Ticket', 'DESC')
    .execute().then(response => {

    const orders = response.asArray();

    for (const order of orders) {
      const symbolId = order['SymbolId'];
      const currencyId = order['AccountNumbers.CurrencyId'];

      order['OpenPrice'] = mt7.priceFromInt(symbolId, order['OpenPrice']);
      order['Profit'] = mt7.depositFromInt(currencyId, order['Profit']);
      order['Commission'] = mt7.depositFromInt(currencyId, order['Commission']);
      order['Volume'] = mt7.volumeFromInt(symbolId, order['Volume']);
    }

    console.log(orders);
  });
});
