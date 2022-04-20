const https = require('https');
const url = require('url');
const jayson = require('jayson');
const Search = require('./search');

const SessionType = {
  TRADER: 0,
  WITHDRAW: 4,
};

/**
 * Convert float to integer
 *
 * @param number Float number
 * @param digits Fractional digits
 * @return {number} Integer number
 */
const toInt = (number, digits) => parseInt(parseFloat(`${number}e${digits}`));

/**
 * Convert integer to float
 *
 * @param number Integer number
 * @param digits Fractional digits
 * @return {number} Float number
 */
const toFloat = (number, digits) => parseFloat(`${number}e-${digits}`);

/**
 * MobiusTrader API
 */
class MobiusTrader {
  /**
   * @param {Object} config Config
   * @param {string} config.host The hostname of the API server
   * @param {number} config.port The port of the API server
   * @param {number} config.brokerId Broker ID
   * @param {string} config.password API password
   */
  constructor(config) {
    if (!config.host || !config.port || !config.brokerId || !config.password) {
      throw new Error('MobiusTraderConfig');
    }

    this._config = config;
    this._currencies = null;
    this._symbols = null;
    this._client = null;
  }

  /**
   * Call API method
   *
   * @param {string} method The name of the method
   * @param {Object} params Key-value parameters
   * @return {Promise}
   */
  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      this._client.request(method, params, (err, response) => {
        const error = err || (response.error ? response.error.error : null);
        if (error) {
          reject(error);
        } else {
          resolve(response.result);
        }
      });
    });
  }

  /**
   * Initialization of work with API
   *
   * @description Initialization of work with API. Called before calls to the API methods.
   * @return {Promise<MobiusTrader>}
   */
  async init() {
    if (!this._client) {
      const { host, port, brokerId, password } = this._config;
      this._client = jayson.client.http({
        host: host,
        port: port,
        headers: {
          Authorization: `Basic ${Buffer.from(`${brokerId}:${password}`).toString('base64')}`,
        },
      });
    }

    await this._loadSymbols();

    await this._loadCurrencies();

    return this;
  }

  async _loadSymbols() {
    if (!this._symbols) {
      this._symbols = await this.call('SymbolsGet');
    }
  }

  async _loadCurrencies() {
    if (!this._currencies) {
      this._currencies = await this.call('CurrenciesGet');
    }
  }

  /**
   * Returns an array of all symbols
   *
   * @return {Array}
   */
  getSymbols() {
    return this._symbols;
  }

  /**
   * Get data on a symbol by its Id or Name
   *
   * @param {string | number} symbol Id or Name of symbol
   * @return {Object}
   */
  getSymbol(symbol) {
    const key = Number.isInteger(symbol) ? 'Id' : 'Name';
    return this._symbols.find(item => item[key] === symbol);
  }

  /**
   * Convert price from integer to float
   *
   * @param {string | number} symbol Id or Name of symbol
   * @param {number} price Price in integer
   * @return {number} Price in float
   */
  priceFromInt(symbol, price) {
    const symbolInfo = this.getSymbol(symbol);
    return toFloat(price, symbolInfo.FractionalDigits);
  }

  /**
   * Convert price from float to integer
   *
   * @param {string | number} symbol Id or Name of symbol
   * @param {number} price Price in flost
   * @return {number} Price in integer
   */
  priceToInt(symbol, price) {
    const symbolInfo = this.getSymbol(symbol);
    return toInt(price, symbolInfo.FractionalDigits);
  }

  /**
   * Convert volume from integer to float
   *
   * @param {string | number} symbol Id or Name of symbol
   * @param {number} volume Volume in integer
   * @return {number} Price in float
   */
  volumeFromInt(symbol, volume) {
    const symbolInfo = this.getSymbol(symbol);
    const marginCurrency = this.getCurrency(symbolInfo['MarginCurrencyId']);
    return toFloat(volume, marginCurrency['VolumeFractionalDigits']);
  }

  /**
   * Convert volume from float to integer
   *
   * @param {string | number} symbol Id or Name of symbol
   * @param {number} volume Volume in float
   * @return {number} Price in integer
   */
  volumeToInt(symbol, volume) {
    const symbolInfo = this.getSymbol(symbol);
    const marginCurrency = this.getCurrency(symbolInfo['MarginCurrencyId']);
    return toInt(volume, marginCurrency['VolumeFractionalDigits']);
  }

  /**
   * Returns an array of all currencies
   *
   * @return {Array}
   */
  getCurrencies() {
    return this._currencies;
  }

  /**
   * Get data on a currency by its Id or Name
   *
   * @param {string | number} currency Id or Name of currency
   * @return {Object}
   */
  getCurrency(currency) {
    const key = Number.isInteger(currency) ? 'Id' : 'Name';
    return this._currencies.find(item => item[key] === currency);
  }

  /**
   * Get quotes for symbols
   *
   * @param {Array<string>} symbols Array of symbols
   * @return {Promise}
   */
  getQuotes(symbols) {
    return this.call('SymbolQuotesGet', {
      'Symbols': symbols
    });
  }

  /**
   * Account information
   *
   * @param {number} id Account ID
   * @return {Object}
   */
  getAccount(id) {
    return this.call('AccountGet', {
      'Id': id
    });
  }

  getAccountNumber(id) {
    return this.call('AccountNumberGet', {
      'Id': id
    });
  }

  getAccountNumbers(accountId) {
    return this.call('AccountNumbersGet', {
      'Id': accountId
    });
  }

  async getAccountBalance(accountId, currency = 'USD') {
    const accountNumbers = (await this.getAccountNumbers(accountId))
      .filter(item => item.Type === MobiusTrader.AccountNumberType.REAL)
      .map(item => item.Id);

    const moneyInfo = await this.moneyInfo(accountNumbers, currency);

    let balance = 0;

    accountNumbers.forEach(accountNumberId => {
      const money = moneyInfo[accountNumberId];
      balance += money.Free - money.Credit;
    });

    return balance;
  }

  createAccount(email,
                name,
                agentAccount = null,
                country = '',
                city = '',
                address = '',
                phone = '',
                zipCode = '',
                state = '',
                comment = '',
                lastName = '',
                agentTag = '',
                ip = '',
                userAgent = ''
  ) {
    return this.call('AccountCreate', {
      Name: name,
      LastName: lastName,
      Email: email,
      AgentAccount: agentAccount,
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
    });
  }

  createAccountNumber(type, accountId, leverage, settingsTemplate, displayName, tags = []) {
    return this.call('AccountNumberCreate', {
      AccountId: Number(accountId),
      Leverage: Number(leverage),
      SettingsTemplate: settingsTemplate,
      DisplayName: displayName,
      Tags: tags,
      Type: type,
    });
  }

  passwordSet(accountId, login, password, sessionType = SessionType.TRADER) {
    return this.call('PasswordSet', {
      AccountId: Number(accountId),
      Login: login,
      Password: password,
      SessionType: sessionType,
    });
  }

  passwordCheck(login, password, sessionType = SessionType.TRADER) {
    return this.call('PasswordCheck', {
      Login: login,
      Password: password,
      SessionType: sessionType,
    });
  }

  traderPasswordSet(accountId, login, password) {
    return this.passwordSet(accountId, login, password, SessionType.TRADER);
  }

  traderPasswordCheck(login, password) {
    return this.passwordCheck(login, password, SessionType.TRADER);
  }

  withdrawPasswordSet(accountId, password) {
    return this.passwordSet(accountId, accountId, password, SessionType.WITHDRAW);
  }

  withdrawPasswordCheck(accountId, password) {
    return this.passwordCheck(accountId, password, SessionType.WITHDRAW);
  }

  depositToInt(currency, amount) {
    const currencyInfo = this.getCurrency(currency);
    return toInt(amount, currencyInfo['DepositFractionalDigits']);
  }

  depositFromInt(currency, amount) {
    const currencyInfo = this.getCurrency(currency);
    return toFloat(amount, currencyInfo['DepositFractionalDigits']);
  }

  fundsDeposit(currency, accountNumberId, amount, paySystemCode, purse = '') {
    const comment = ['DP', paySystemCode, this.depositFromInt(currency, amount), purse].join(' ').trim();
    return this.balanceAdd(accountNumberId, amount, comment);
  }

  async fundsWithdraw(currency, accountNumberId, amount, paySystemCode, purse = '') {
    const comment = ['WD', paySystemCode, this.depositFromInt(currency, amount), purse].join(' ').trim();
    const money = await this.moneyInfo(accountNumberId);

    if (money.Free - money.Credit < amount) {
      throw 'NotEnoughMoney';
    }

    return this.balanceAdd(accountNumberId, -amount, comment);
  }

  async moneyInfo(accountNumbers, currency = undefined) {
    const isInt = Number.isInteger(accountNumbers);
    const result = await this.call('MoneyInfo', {
      AccountNumbers: isInt ? [accountNumbers] : accountNumbers,
      Currency: currency,
    });
    return isInt ? result[accountNumbers] : result;
  }

  async balanceAdd(accountNumberId, amount, comment) {
    const result = await this.call('BalanceAdd', {
      AccountNumberId: accountNumberId,
      Amount: amount,
      Comment: comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  async bonusAdd(accountNumberId, amount, comment) {
    const result = await this.call('BonusAdd', {
      AccountNumberId: accountNumberId,
      Amount: amount,
      Comment: comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  async creditAdd(accountNumberId, amount, comment) {
    if (arguments.length === 4) {
      accountNumberId = arguments[1];
      amount = arguments[2];
      comment = arguments[3];
    }
    const result = await this.call('CreditAdd', {
      AccountNumberId: accountNumberId,
      Amount: amount,
      Comment: comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  orderOpen(accountNumberId, symbolId, volume, tradeCmd, price = 0, sl = 0, tp = 0, comment = '') {
    return this.call('AdminOpenOrder', {
      AccountNumberId: accountNumberId,
      SymbolId: symbolId,
      Volume: volume,
      TradeCmd: tradeCmd,
      Price: price,
      Sl: sl,
      Tp: tp,
      Comment: comment,
    });
  }

  /**
   *
   * @param ticket
   * @param params Volume, Sl, Tp, OpenPrice, ClosePrice, Comment, UserData
   * @return {Promise}
   */
  orderModify(ticket, params = {}) {
    return this.call('AdminModifyOrder', Object.assign({
      Ticket: ticket,
    }, params));
  }

  /**
   * @param ticket
   * @param params Volume, Price
   * @return {Promise}
   */
  orderClose(ticket, params = {}) {
    return this.call('AdminCloseOrder', Object.assign({
      Ticket: ticket,
    }, params));
  }

  orderDelete(ticket) {
    return this.call('AdminDeleteOrder', {
      Ticket: ticket,
    });
  }

  /**
   * @param accountId
   * @param ip
   * @param userAgent
   * @returns {Promise<string>}
   */
  getJWT(accountId, ip, userAgent) {
    return this.call('GetJWT', {
      AccountId: accountId,
      IP: ip,
      UserAgent: userAgent,
    });
  }

  traderAuth(login, password, ip, userAgent) {
    return this.call('ApiTraderAuth', {
      Login: login,
      Password: password,
      IP: ip,
      UserAgent: userAgent,
    });
  }

  search() {
    return this.searchArray(Array.prototype.slice.call(arguments));
  }

  searchArray(arr) {
    return new Search(this, arr);
  }

  expr(string, parameters = null) {
    return Search.expr(string, parameters);
  }

  /**
   * Search context: Orders
   *
   * @deprecated
   * @returns {string}
   */
  fromOrders() {
    return 'Orders';
  }

  log(...args) {
    console.log(...args.map(message => JSON.stringify(message, null, 1)));
  }

  _post(hostname, path, params = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(params);
      const parseHostName = url.parse(hostname);

      const options = {
        hostname: parseHostName.hostname,
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, res => {
        if (res.statusCode !== 200) {
          reject(res.statusCode);
          return;
        }

        const response = [];

        res.on('data', data => {
          response.push(data.toString());
        });

        res.on('end', () => {
          resolve(JSON.parse(response.join('')));
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);

      req.end();
    });
  }
}

MobiusTrader.TradeCmd = {
  BUY: 0,
  SELL: 1,
  BUY_LIMIT: 2,
  SELL_LIMIT: 3,
  BUY_STOP: 4,
  SELL_STOP: 5,
  BALANCE: 6,
  CREDIT: 7,
};

MobiusTrader.AccountNumberType = {
  TEST: 0,
  REAL: 1,
  DEMO: 2,
  TIS: 3,
  INVEST: 4,
};

MobiusTrader.SEARCH_CONTEXT = {
  Accounts: 'Accounts',
  AccountNumbers: 'AccountNumbers',
  BinaryOptions: 'BinaryOptions',
  Orders: 'Orders',
};

MobiusTrader.SessionType = SessionType;

MobiusTrader.toInt = toInt;

MobiusTrader.toFloat = toFloat;

const instances = {};

/**
 * @param config
 * @returns {Promise<MobiusTrader>}
 */
MobiusTrader.getInstance = async (config = {}) => {
  const {brokerId} = config;
  if (!instances[brokerId]) {
    instances[brokerId] = new MobiusTrader(config);
    await instances[brokerId].init();
  }

  return instances[brokerId];
};

module.exports = MobiusTrader;
