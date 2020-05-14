const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const email = 'test2@mobius-soft.org';
  const password = 'test111';

  const right = await mt7.passwordCheck(email, password);

  mt7.log(right ? 'Right' : 'Wrong');
}

run();
