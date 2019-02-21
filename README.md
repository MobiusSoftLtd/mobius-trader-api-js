# MobiusTrader 7 JS API 


```javascript

const MobiusTrader = require('mobius-trader-api');

const config = {
  host: 'mt7.example.com',
  port: 3003,
  brokerId: 123456,
  password: 'api_password'
};

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const accountId = 123;
  
  try {
    const info = await mt7.getAccount(accountId);
    console.log(info);
  } catch (e) {
    console.error(e);
  }
});
```

