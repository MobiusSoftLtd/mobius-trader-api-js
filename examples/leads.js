const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const response = await mt7.search(
      'Id','Name', 'CommentTime'
    )
      .from('Leads')
      .where('Id', '>', 0)
      .execute();

   console.log(JSON.stringify(response.asArray(), null, 2));
  } catch (e) {
    console.error(e);
  }
})();
