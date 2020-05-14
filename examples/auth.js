const MobiusTrader = require('../');
const config = require('./config');

async function run() {
  const mt7 = await MobiusTrader.getInstance(config);

  const login = 'test@test.ru';
  const password = 'test123';
  const clientIP = '10.11.12.13';
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36';

  try {
    const jwt = await mt7.traderAuth(login, password, clientIP, userAgent);

    mt7.log(jwt);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
