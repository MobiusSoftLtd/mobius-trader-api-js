const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const email = 'test2@mobius-soft.org';
    const currentPassword = 'test111';
    const newPassword = 'test222';

    const mt7 = await MobiusTrader.getInstance(config);

    // If the password is incorrect, an error will throw
    await mt7.call('PasswordCheck', {
      Login: email,
      Password: currentPassword,
      SessionType: MobiusTrader.SessionType.TRADER,
    });

    const clientId = (
      await mt7.search('Id')
        .from(MobiusTrader.SEARCH_CONTEXT.Clients)
        .where('Email', '=', email)
        .limit(1)
        .execute()
    ).get('Id');

    if (!clientId) {
      throw new Error('ClientNotFound');
    }

    await mt7.call('PasswordSet', {
      ClientId: Number(clientId),
      Login: email,
      Password: newPassword,
      SessionType: MobiusTrader.SessionType.TRADER,
    });

    console.log('Password changed');
  } catch (e) {
    console.error(e);
  }
})();
