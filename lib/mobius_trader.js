const jayson = require('jayson');
const { URL } = require('url');
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
   * @param {number} config.token Access Token
   * @param {number} config.brokerId Broker ID
   * @param {string} config.password API password
   * @param {string} config.url API url
   * @param {boolean} config.floatMode Float Mode
   */
  constructor(config) {
    if (!config.token && (!config.brokerId || !config.password)) {
      throw new Error('MobiusTraderConfig');
    }

    this._config = {
      url: 'https://mtrader7api.com/v2',
      floatMode: false,
      ...config,
    };
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
      const {
        token,
        brokerId,
        password,
        floatMode = false,
        url,
      } = this._config;

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'MT7-JS/3.0.1',
        'Authorization': token
          ? `Bearer ${token}`
          : `Basic ${Buffer.from(`${brokerId}:${password}`).toString('base64')}`,
      };

      if (floatMode) {
        headers['X-FloatMode'] = 'true';
      }

      const { hostname, protocol, pathname, port} = new URL(url);

      const options = {
        host: hostname,
        port: port || 443,
        path: pathname,
        method: 'POST',
        headers,
      };

      this._client = jayson.client[protocol.replace(':', '')](options);
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
   * @deprecated Use call() instead.
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
   * @deprecated Use call() instead.
   * @param {number} id Account ID
   * @return {Object}
   */
  getClient(id) {
    return this.call('ClientGet', {
      'Id': id
    });
  }

  /**
   * @deprecated Use call() instead.
   * @param id
   * @returns {Promise}
   */
  getTradingAccount(id) {
    return this.call('TradingAccountGet', {
      'Id': id
    });
  }

  /**
   * @deprecated Use call() instead.
   */
  getTradingAccounts(clientId) {
    return this.call('TradingAccountsGet', {
      'Id': clientId
    });
  }

  async getClientBalance(clientId, currency = 'USD') {
    const tradingAccounts = (await this.getTradingAccounts(clientId))
      .filter(item => item.Type === MobiusTrader.TradingAccountType.REAL)
      .map(item => item.Id);

    const moneyInfo = await this.moneyInfo(tradingAccounts, currency);

    let balance = 0;

    tradingAccounts.forEach(tradingAccountId => {
      const money = moneyInfo[tradingAccountId];
      balance += money.Free - money.Credit;
    });

    return balance;
  }

  /**
   * @deprecated Use call() instead.
   */
  createClient(email,
                name,
                agentClient = null,
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
    return this.call('ClientCreate', {
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
    });
  }

  /**
   * @deprecated Use call() instead.
   */
  createTradingAccount(type, clientId, leverage, settingsTemplate, displayName, tags = []) {
    return this.call('TradingAccountCreate', {
      ClientId: Number(clientId),
      Leverage: Number(leverage),
      SettingsTemplate: settingsTemplate,
      DisplayName: displayName,
      Tags: tags,
      Type: type,
    });
  }

  /**
   * @deprecated Use call() instead.
   */
  passwordSet(clientId, login, password, sessionType = SessionType.TRADER) {
    return this.call('PasswordSet', {
      ClientId: Number(clientId),
      Login: login,
      Password: password,
      SessionType: sessionType,
    });
  }

  /**
   * @deprecated Use call() instead.
   */
  passwordCheck(login, password, sessionType = SessionType.TRADER) {
    return this.call('PasswordCheck', {
      Login: login,
      Password: password,
      SessionType: sessionType,
    });
  }

  /**
   * @deprecated Use call() instead.
   */
  traderPasswordSet(clientId, login, password) {
    return this.passwordSet(clientId, login, password, SessionType.TRADER);
  }

  /**
   * @deprecated Use call() instead.
   */
  traderPasswordCheck(login, password) {
    return this.passwordCheck(login, password, SessionType.TRADER);
  }

  /**
   * @deprecated Use call() instead.
   */
  withdrawPasswordSet(clientId, password) {
    return this.passwordSet(clientId, clientId, password, SessionType.WITHDRAW);
  }

  /**
   * @deprecated Use call() instead.
   */
  withdrawPasswordCheck(clientId, password) {
    return this.passwordCheck(clientId, password, SessionType.WITHDRAW);
  }

  depositToInt(currency, amount) {
    const currencyInfo = this.getCurrency(currency);
    return toInt(amount, currencyInfo['DepositFractionalDigits']);
  }

  depositFromInt(currency, amount) {
    const currencyInfo = this.getCurrency(currency);
    return toFloat(amount, currencyInfo['DepositFractionalDigits']);
  }

  fundsDeposit(currency, tradingAccountId, amount, paySystemCode, purse = '') {
    const comment = ['DP', paySystemCode, this.depositFromInt(currency, amount), purse].join(' ').trim();
    return this.balanceAdd(tradingAccountId, amount, comment);
  }

  async fundsWithdraw(currency, tradingAccountId, amount, paySystemCode, purse = '') {
    const comment = ['WD', paySystemCode, this.depositFromInt(currency, amount), purse].join(' ').trim();
    const money = await this.moneyInfo(tradingAccountId);

    if (money.Free - money.Credit < amount) {
      throw 'NotEnoughMoney';
    }

    return this.balanceAdd(tradingAccountId, -amount, comment);
  }

  async moneyInfo(tradingAccounts, currency = undefined) {
    const isInt = Number.isInteger(tradingAccounts);
    const result = await this.call('MoneyInfo', {
      TradingAccounts: isInt ? [tradingAccounts] : tradingAccounts,
      Currency: currency,
    });
    return isInt ? result[tradingAccounts] : result;
  }

  /**
   * @deprecated Use call() instead.
   */
  async balanceAdd(tradingAccountId, amount, comment) {
    const result = await this.call('BalanceAdd', {
      TradingAccountId: tradingAccountId,
      Amount: amount,
      Comment: comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  /**
   * @deprecated Use call() instead.
   */
  async bonusAdd(tradingAccountId, amount, comment) {
    const result = await this.call('BonusAdd', {
      TradingAccountId: tradingAccountId,
      Amount: amount,
      Comment: comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  /**
   * @deprecated Use call() instead.
   */
  async creditAdd(tradingAccountId, amount, comment) {
    if (arguments.length === 4) {
      tradingAccountId = arguments[1];
      amount = arguments[2];
      comment = arguments[3];
    }
    const result = await this.call('CreditAdd', {
      TradingAccountId: tradingAccountId,
      Amount: amount,
      Comment: comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  /**
   * @deprecated Use call() instead.
   */
  orderOpen(tradingAccountId, symbolId, volume, tradeCmd, price = 0, sl = 0, tp = 0, comment = '') {
    return this.call('AdminOpenOrder', {
      TradingAccountId: tradingAccountId,
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
   * @deprecated Use call() instead.
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
   * @deprecated Use call() instead.
   * @param ticket
   * @param params Volume, Price
   * @return {Promise}
   */
  orderClose(ticket, params = {}) {
    return this.call('AdminCloseOrder', Object.assign({
      Ticket: ticket,
    }, params));
  }

  /**
   * @deprecated Use call() instead.
   * @param ticket
   * @returns {Promise}
   */
  orderDelete(ticket) {
    return this.call('AdminDeleteOrder', {
      Ticket: ticket,
    });
  }

  /**
   * @deprecated Use call() instead.
   * @param clientId
   * @param ip
   * @param userAgent
   * @returns {Promise<string>}
   */
  getJWT(clientId, ip, userAgent) {
    return this.call('GetJWT', {
      ClientId: clientId,
      IP: ip,
      UserAgent: userAgent,
    });
  }

  /**
   * @deprecated Use call() instead.
   * @param login
   * @param password
   * @param ip
   * @param userAgent
   * @returns {Promise}
   */
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

MobiusTrader.TradingAccountType = {
  TEST: 0,
  REAL: 1,
  DEMO: 2,
  TIS: 3,
  INVEST: 4,
};

MobiusTrader.SEARCH_CONTEXT = {
  Clients: 'Clients',
  TradingAccounts: 'TradingAccounts',
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
