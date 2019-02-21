const MobiusTrader = require('../');
const config = require('./config');

const mt7 = new MobiusTrader(config);

mt7.init().then(async () => {
  const email = 'test2@mobius-soft.org';
  const password = 'test111';

  const right = await mt7.passwordCheck(email, password);

  if (right) {
    console.log('Right');
  } else {
    console.log('Wrong');
  }
});
