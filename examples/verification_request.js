const fs = require('node:fs');
const path = require('node:path');
const MobiusTrader = require('../');
const config = require('./config');

(async () => {
  try {
    const mt7 = await MobiusTrader.getInstance(config);

    const clientId = 1;

    const attachments = [];

    const fileBuffer = fs.readFileSync(path.resolve(__dirname, 'assets', 'id.jpg'));
    attachments.push({
      filename: 'id.jpg',
      content: fileBuffer.toString('base64'),
    });

    const response = await mt7.call('VerificationRequest', {
      ClientId: clientId,
      Attachments: attachments,
    });

    mt7.log(response);
  } catch (e) {
    console.error(e);
  }
})();
