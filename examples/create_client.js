const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const email = 'test222@mobius-soft.org';
    const name = 'Test';
    const lastName = 'Client';
    const password = 'test111';
    const withdrawPassword = 'test222';
    const agentClient = null;
    const country = 'Russia';
    const city = 'Moscow';
    const address = 'Street';
    const phone = '+791234567890';
    const zipCode = '123456';
    const state = 'Moscow';
    const comment = '';
    const agentTag = 'tag';
    const ip = '11.22.33.44';
    const userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0';
    const lang = 'en';

    // Create client
    const client = await mt7.call('ClientCreate', {
      Name: name,
      LastName: lastName,
      Email: email,
      AgentClient: agentClient,
      Country: country,
      City: city,
      Phone: phone,
      State: state,
      ZipCode: zipCode,
      Address: address,
      Comment: comment,
      AgentTag: agentTag,
      IP: ip,
      UserAgent: userAgent,
      Lang: lang,
    });

    // Set trader password
    await mt7.call('PasswordSet', {
      ClientId: client.Id,
      Login: email,
      Password: password,
      SessionType: MobiusTrader.SessionType.TRADER,
    });

    // Set a password for withdrawal
    await mt7.call('PasswordSet', {
      ClientId: client.Id,
      Login: client.Id,
      Password: withdrawPassword,
      SessionType: MobiusTrader.SessionType.WITHDRAW,
    });

    mt7.log(client);
  } catch (e) {
    console.error(e);
  }
})();
