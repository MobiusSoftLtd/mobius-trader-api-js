const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const login = 'test@example.com';
    const password = 'testPassword';
    const clientIP = '10.11.12.13';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36';

    const { JWT, ClientId } = await mt7.call('ApiTraderAuth', {
      Login: login,
      Password: password,
      IP: clientIP,
      UserAgent: userAgent,
    });

    mt7.log(`JWT: ${JWT} ClientId: ${ClientId}`);
  } catch (e) {
    console.error(e);
  }
})();
