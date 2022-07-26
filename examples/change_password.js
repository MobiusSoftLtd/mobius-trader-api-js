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

    const accountId = (
      await mt7.search('Id')
        .from(MobiusTrader.SEARCH_CONTEXT.Accounts)
        .where('Email', '=', email)
        .limit(1)
        .execute()
    ).get('Id');

    if (!accountId) {
      throw new Error('AccountNotFound');
    }

    await mt7.call('PasswordSet', {
      AccountId: Number(accountId),
      Login: email,
      Password: newPassword,
      SessionType: MobiusTrader.SessionType.TRADER,
    });

    console.log('Password changed');
  } catch (e) {
    console.error(e);
  }
})();
