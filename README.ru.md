# MobiusTrader 7 JavaScript Manager API

| [English](README.md) | [Русский](README.ru.md) | 

# Установка

```bash
npm install mobius-trader-api --save
```
или
```bash
yarn add mobius-trader-api
```

# Использование
```javascript
const MobiusTrader = require('mobius-trader-api');

const config = {
    host: 'mt7.example.com',
    port: 3003,
    brokerId: 123456,
    password: 'api_password',
    terminalURL: 'https://mt7.example.com/',
};

async function run() {
    const mt7 = await MobiusTrader.getInstance(config);

    const accountId = 123;
    
    try {
        const info = await mt7.getAccount(accountId);
        console.log(info);
    } catch (e) {
        console.error(e);
    }
}

run();
```

# Доступные JSON-RPC методы API
| [English](https://docs.google.com/document/d/1rq2K18d455C0p8a9xXwv-KZowiVARTFTmS7R9avm1m8/edit) | [Русский](https://docs.google.com/document/d/17I06cT9A_PX_89URFOUXlu3oBYdm3sYHMvRtEx6gAOA/edit) |

Все методы, описанные в документации можно вызывать при помощи метода **call()**:
```javascript
const account = await mt7.call('AccountGet', {
  'Id': accountId,
});
```

# Поиск
Для поиска реализован универсальный метод **Search**, который очень похож на SQL:
```javascript
const accountNumbers = await mt7.call('Search',{
    Context: 'AccountNumbers', 
    Select: ['Id'], 
    Where: [
        'AccountId', '=', accountId, 'AND', 
        'CurrencyId', '=', 23
    ], 
    Limit: 10,
    Offset: 0,
    SortBy: 'Id',
    SortDir: 'ASC',
});
```
Тут:
 - **Context** - Какие данные нужно получить. Доступные варианты: Accounts, AccountNumbers, Orders, BinaryOptions
 - **Select** - Список полей, которые необходимо вернуть
 - **Where** - Условия поиска
 - **SortBy** - Поле для сортировки
 - **SortDir** - Направление сортировки, доступны варианты: ASC и DESC
 - **GroupBy** - Поле для группировки
 - **Limit** - Количество возвращаемых строк
 - **Offset** - Количество строк, которые необходимо пропустить
 
Обязательные поля: Context, Select и Where

####Query Builder
В данной библиотеке предусмотрен Query Builder, который позволяет более удобно работать с поиском.

Пример:
```javascript
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
    [mt7.expr('Profit + Commission + Swap'), 'TotalProfit']
  )
    .from(MobiusTrader.SEARCH_CONTEXT.Orders)
    .where('AccountNumberId', '=', 123)
    .andWhere('CloseTime', '>', 0)
    .andWhere('TradeCmd', 'IN', [
      MobiusTrader.TradeCmd.BUY,
      MobiusTrader.TradeCmd.SELL,
    ])
    .limit(10)
    .offset(0)
    .orderBy('Ticket', 'DESC')
    .execute();

// Вернет массив объектов, с полями перечисленными в select
const orders = response.asArray();

// Массив из Ticket-ов 
const tickets = response.asArray('Ticket');

// Объект, где ключ это Ticket, а значение объект с полями
const mapByTicket = response.asMap('Ticket');

// Объект, где ключ это Ticket, а значение Profit
const mapProfits = response.asMap('Ticket', 'Profit');

// Возвращает первую запись. Полезно если выбирается только одна запись.
const first = response.first();
```

Построение запроса начинается с метода **search()**, который возвращает экземпляр класса Search и делает возможным сборку последующих методов для текущего объекта в одну цепочку.
В качестве аргументов метод принимает список полей, которые необходимо вернуть (Select в API).

Для указания алиаса для поля исользуется массив:
```javascript
['FieldName', 'FieldAlias']
```

Если необходимо вернуть аггнерированный результат, то используется метод **expr()**:
```javascript
[mt7.expr('Profit + Commission + Swap'), 'TotalProfit']
```

Для указания контекста (Context из API) поиска используется метод **from()**. Доступные варианты перечислены в MobiusTrader.SEARCH_CONTEXT

Для того, чтобы манипулировать условиями запросов существуют методы **where()**, **andWhere()** и **orWhere()**. 
Все эти методы принимают три параметра: название поля, оператор (равно, больше, меньше и т.д.) и значение, которое будет искаться.

Доступные операторы поиска:  
 - \>
 - \>= 
 - < 
 - <= 
 - != 
 - = 
 - IN 
 - NOT IN
 - LIKE
 - NOT LIKE
 - REGEXP
 - NOT REGEXP
 
 
На случай, когда нужно получить множественное условие предусмотрены специальные «скобки» **whereOpen()**, **whereClose()**, **andWhereOpen()**,  **andWhereClose()**, **orWhereOpen()**,  **orWhereClose()**. 

Допустим неоходимо выбрать сделку с текетом 1 и датой открытия более суток назад или выбрать сделку с идентификатором 2 и датой открытия менее суток назад.

```javascript
const response = mt7.search('Ticket', 'CloseTime')
        .from(MobiusTrader.SEARCH_CONTEXT.Orders)
        .whereOpen()
        .where('Ticket', '=', 1)
        .andWhere('CloseTime', '<', Date.now() - 86400000)
        .whereClose()
        .orWhereOpen()
        .where('Ticket', '=', 2)
        .andWhere('CloseTime', '>', Date.now() - 86400000)
        .orWhereClose()
        .execute();
```

Для сортировки данных используется метод **orderBy()**, который принимает 2 параметра: поле и направление сортировки (SortBy и SortDir в API)
```javascript
.orderBy('Ticket', 'DESC')
```
Для ограничения количества возвращаемых записей используется метод **limit()**.
 
При необходимости сделать сдвиг (например при постраничном выводе) используется **offset()**. 
