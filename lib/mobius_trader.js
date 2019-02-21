const jayson = require('jayson');
const Search = require('./search');

const toInt = (number, digits) => parseInt(parseFloat(`${number}e${digits}`));
const toFloat = (number, digits) => parseFloat(`${number}e-${digits}`);

class MobiusTrader {
  constructor(config = {}) {
    this._config = config;
    this._currencies = null;
    this._symbols = null;
  }

  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      this._client.request(method, params, (err, response) => {
        const error = err || response.error;
        if (error) {
          reject(error);
        } else {
          resolve(response.result);
        }
      });
    });
  }

  async init() {
    const { host, port, brokerId, password } = this._config;
    this._client = jayson.client.http({
      host: host,
      port: port,
      headers: {
        Authorization: `Basic ${Buffer.from(`${brokerId}:${password}`).toString('base64')}`,
      },
    });

    await this.loadSymbols();
    await this.loadCurrencies();
  }

  async loadSymbols() {
    this._symbols = await this.call('SymbolsGet');
  }

  async loadCurrencies() {
    this._currencies = await this.call('CurrenciesGet');
  }

  getSymbols() {
    return this._symbols;
  }

  getSymbol(symbol) {
    const key = Number.isInteger(symbol) ? 'Id' : 'Name';
    return this._symbols.find(item => item[key] === symbol);
  }

  priceFromInt(symbol, price) {
    const symbolInfo = this.getSymbol(symbol);
    return toFloat(price, symbolInfo.FractionalDigits);
  }

  priceToInt(symbol, price) {
    const symbolInfo = this.getSymbol(symbol);
    return toInt(price, symbolInfo.FractionalDigits);
  }

  volumeFromInt(symbol, volume) {
    const symbolInfo = this.getSymbol(symbol);
    const marginCurrency = this.getCurrency(symbolInfo['MarginCurrencyId']);
    return toFloat(volume, marginCurrency['VolumeFractionalDigits']);
  }

  volumeToInt(symbol, volume) {
    const symbolInfo = this.getSymbol(symbol);
    const marginCurrency = this.getCurrency(symbolInfo['MarginCurrencyId']);
    return toInt(volume, marginCurrency['VolumeFractionalDigits']);
  }

  getCurrencies() {
    return this._currencies;
  }

  getCurrency(currency) {
    const key = Number.isInteger(currency) ? 'Id' : 'Name';
    return this._currencies.find(item => item[key] === currency);
  }

  getQuotes(symbols) {
    return this.call('SymbolQuotesGet', {
      'Symbols': symbols
    });
  }

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
                comment = '') {
    const data = {
      'Name': name,
      'Email': email,
      'AgentAccount': agentAccount,
      'Country': country,
      'City': city,
      'Phone': phone,
      'State': state,
      'ZipCode': zipCode,
      'Address': address,
      'Comment': comment,
    };

    return this.call('AccountCreate', data);
  }

  createAccountNumber(type, accountId, leverage, settingsTemplate, displayName, tags = []) {
    return this.call('AccountNumberCreate', {
      'AccountId': Number(accountId),
      'Leverage': Number(leverage),
      'SettingsTemplate': settingsTemplate,
      'DisplayName': displayName,
      'Tags': tags,
      'Type': type,
    });
  }

  passwordSet(accountId, login, password) {
    return this.call('PasswordSet', {
      'AccountId': Number(accountId),
      'Login': login,
      'Password': password,
      'SessionType': 0,
    });
  }

  passwordCheck(login, password) {
    return this.call('PasswordCheck', {
      'Login': login,
      'Password': password,
      'SessionType': 0,
    });
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
      'AccountNumbers': isInt ? [accountNumbers] : accountNumbers,
      Currency: currency,
    });

    return isInt ? result[accountNumbers] : result;
  }

  async balanceAdd(accountNumberId, amount, comment) {
    const result = await this.call('BalanceAdd', {
      'AccountNumberId': accountNumberId,
      'Amount': amount,
      'Comment': comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  async bonusAdd(accountNumberId, amount, comment) {
    const result = await this.call('BonusAdd', {
      'AccountNumberId': accountNumberId,
      'Amount': amount,
      'Comment': comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  async creditAdd(currency, accountNumberId, amount, comment) {
    const result = await this.call('CreditAdd', {
      'AccountNumberId': accountNumberId,
      'Amount': amount,
      'Comment': comment,
    });

    return result && result.Ticket ? result.Ticket : false;
  }

  orderOpen(accountNumberId, symbolId, volume, tradeCmd, price = 0, sl = 0, tp = 0, comment = '') {
    return this.call('AdminOpenOrder', {
      'AccountNumberId': accountNumberId,
      'SymbolId': symbolId,
      'Volume': volume,
      'TradeCmd': tradeCmd,
      'Price': price,
      'Sl': sl,
      'Tp': tp,
      'Comment': comment,
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
      'Ticket': ticket,
    }, params));
  }

  /**
   * @param ticket
   * @param params Volume, Price
   * @return {Promise}
   */
  orderClose(ticket, params = {}) {
    return this.call('AdminCloseOrder', Object.assign({
      'Ticket': ticket,
    }, params));
  }

  orderDelete(ticket) {
    return this.call('AdminDeleteOrder', {
      'Ticket': ticket,
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

  fromOrders() {
    return 'Orders';
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
};

module.exports = MobiusTrader;
