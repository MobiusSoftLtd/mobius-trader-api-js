# MobiusTrader 7 JavaScript Manager API 

| [English](README.md) | [Русский](README.ru.md) |

# Install

```bash
npm install mobius-trader-api --save
```
or
```bash
yarn add mobius-trader-api
```

# Usage
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

# Available JSON-RPC API Methods
| [English](https://docs.google.com/document/d/1rq2K18d455C0p8a9xXwv-KZowiVARTFTmS7R9avm1m8/edit) | [Русский](https://docs.google.com/document/d/17I06cT9A_PX_89URFOUXlu3oBYdm3sYHMvRtEx6gAOA/edit) |

All methods described in the documentation can be called using the **call()** method:
```javascript
const account = await mt7.call('AccountGet', {
  'Id': accountId,
});
```

# Search
For search, a universal **Search** method is implemented, which is very similar to SQL:
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
Fields:
 - **Context** - What data needs to be found. Available options: Accounts, AccountNumbers, Orders, BinaryOptions
 - **Select** - List of fields to be returned
 - **Where** - Search conditions
 - **SortBy** - Sort field
 - **SortDir** - Sorting direction. Options available: ASC и DESC
 - **GroupBy** - Grouping field
 - **Limit** - The number of rows returned
 - **Offset** - The number of rows that will be offset
 
Required fields: Context, Select и Where

####Query Builder
This library provides Query Builder, which allows you to more conveniently work with search.

Example:
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

// Will return an array of objects with fields listed in select
const orders = response.asArray();

// Array of Tickets
const tickets = response.asArray('Ticket');

// An object where the key is Ticket, and the value is an object with fields.
const mapByTicket = response.asMap('Ticket');

// The object where the key is Ticket and the value is Profit.
const mapProfits = response.asMap('Ticket', 'Profit');

// Returns the first record. Useful if only one entry is selected.
const first = response.first();
```

Building a query begins with the **search()** method, which returns an instance of the Search class and makes it possible to assemble subsequent methods for the current object in one chain.
As arguments, the method accepts a list of fields that need to be returned (Select in the API).

An array is used to specify the alias for the field:
```javascript
['FieldName', 'FieldAlias']
```

If it is necessary to return the aggregated result, then the **expr()** method is used:
```javascript
[mt7.expr('Profit + Commission + Swap'), 'TotalProfit']
```

To specify the context (Context from the API) of the search, the **from()** method is used. Available options are listed in MobiusTrader.SEARCH_CONTEXT

In order to manipulate query conditions, there are **where()**, **andWhere()** and **orWhere()** methods.

All these methods take three parameters: the name of the field, the operator (equal, greater, less, etc.) and the value to be searched.

Available search operators:  
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
 
 
In case you need to get a multiple condition, special “brackets” are provided **whereOpen()**, **whereClose()**, **andWhereOpen()**, **andWhereClose()**, **orWhereOpen()**, **orWhereClose()**.

Suppose you want to select a deal with current 1 and an opening date more than a day ago, or choose a deal with identifier 2 and an opening date less than a day ago.

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

To sort the data, the **orderBy()** method is used, which takes 2 parameters: the field and the sort direction (SortBy and SortDir in the API)
```javascript
.orderBy('Ticket', 'DESC')
```
To limit the number of returned records, the **limit()** method is used.

If necessary, make a shift (for example, when paginating) **offset()** is used.
