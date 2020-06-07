class Search {
  constructor(client, columns = null) {
    this._client = client;

    this._query = null;

    this._select = [];

    this._from = '';

    this._where = [];

    this._orderBy = null;
    this._orderDir = null;

    this._groupBy = null;

    this._limit = null;

    this._offset = null;

    this._result = null;

    // Set the initial columns
    if (columns) {
      this._select = columns;
    }
  }

  from(source) {
    this._from = source;

    return this;
  }

  groupBy(column) {
    this._groupBy = column;

    return this;
  }

  offset(number) {
    this._offset = number;

    return this;
  }

  where(column, op, value) {
    return this.andWhere(column, op, value);
  }

  andWhere(column, op, value) {
    this._where.push({'AND': [column, op, value]});

    return this;
  }

  orWhere(column, op, value) {
    this._where.push({'OR': [column, op, value]});

    return this;
  }


  /**
   * Alias of andWhereOpen()
   *
   * @return {Search}
   */
  whereOpen() {
    return this.andWhereOpen();
  }

  /**
   * Opens a new "AND WHERE (...)" grouping.
   *
   * @return {Search}
   */
  andWhereOpen() {
    this._where.push({'AND': '('});

    return this;
  }

  /**
   * Opens a new "Or WHERE (...)" grouping.
   *
   * @return {Search}
   */
  orWhereOpen() {
    this._where.push({'OR': '('});

    return this;
  }

  /**
   * Closes an open "WHERE (...)" grouping.
   *
   * @return {Search}
   */
  whereClose() {
    return this.andWhereClose();
  }

  /**
   * Closes an open "WHERE (...)" grouping.
   *
   * @return {Search}
   */
  andWhereClose() {
    this._where.push({'AND': ')'});

    return this;
  }

  /**
   * Closes an open "WHERE (...)" grouping.
   *
   * @return {Search}
   */
  orWhereClose() {
    this._where.push({'OR': ')'});

    return this;
  }

  /**
   * Applies sorting with "ORDER BY ..."
   *
   * @param   column column name or array(column, alias) or object
   * @param   direction direction of sorting
   * @return {Search}
   */
  orderBy(column, direction = null) {
    this._orderBy = column;
    this._orderDir = direction;

    return this;
  }

  /**
   * Return up to "LIMIT ..." results
   *
   * @param   number maximum results to return or null to reset
   * @return {Search}
   */
  limit(number) {
    this._limit = number;

    return this;
  }

  async execute() {
    this.compile();

    this._result = await this._client.call('Search', this._query);

    return this;
  }

  /**
   * Compile the query and return it.
   *
   * @return  Search
   */
  compile() {
    // Start a selection query
    const query = {};

    query['Context'] = this._from;

    query['Select'] = this._compileSelect(this._select);

    query['Where'] = this._compileWhere(this._where);

    // Add grouping
    if (this._groupBy) {
      query['GroupBy'] = this._groupBy;
    }

    // Add sorting
    if (this._orderBy) {
      query['SortBy'] = this._orderBy;
      query['SortDir'] = this._orderDir ? String(this._orderDir).toUpperCase() : 'ASC';
    }

    // Add limiting
    if (this._limit !== null) {
      query['Limit'] = this._limit;
    }

    // Add offsets
    if (this._offset !== null) {
      query['Offset'] = this._offset;
    }

    this._query = query;

    return this;
  }

  _compileSelect(fieldsSrc = null) {
    if (!fieldsSrc) {
      return [
        'Ticket',
        'SymbolId',
        'Comment',
        'OpenTime',
        'CloseTime',
        'TradeCmd',
        'AccountNumberId',
        'Sl',
        'Tp',
        'Volume',
        'OpenPrice',
        'ClosePrice',
        'Commission',
        'Swap',
        'Profit',
      ];
    }

    const fields = [];

    for (let field of fieldsSrc) {

      if (field instanceof Array && field.length === 2) {
        fields.push({
          'Expr': field[0],
          'As': field[1],
        });
      } else {
        fields.push(field);
      }
    }

    return fields;
  }

  /**
   * Compiles an array of conditions into a partial. Used for WHERE
   * and HAVING.
   *
   * @param   where where statements
   * @return  array
   */
  _compileWhere(where) {
    let lastCondition = null;

    let result = [];
    let item = [];
    let op, value, column;

    for (let group of where) {
      // Process groups of conditions
      for (let [logic, condition] of Object.entries(group)) {
        logic = String(logic).toUpperCase();

        if (condition === '(') {
          if (result && lastCondition !== '(') {
            result.push(logic);
          } else if (item && lastCondition !== '(') {
            item.push(logic);
          }

          if (item) {
            if (!result) {
              result = item;
            } else {
              result.push(item);
            }
            item = [];
          }
        } else if (condition === ')') {
          if (item) {
            result.push(item);
          }
          item = [];
        } else {
          if (item && lastCondition !== '(') {
            item.push(logic);
          } else if (result && lastCondition !== '(') {
            result.push(logic);
          }

          // Split the condition
          [column, op, value] = condition;

          op = String(op).toUpperCase();

          item.push(column);
          item.push(op);
          item.push(this._compileConditionQuery(value, op));
        }

        lastCondition = condition;
      }
    }

    if (item) {
      result.push(item);
    }

    if (!result) {
      result = ['Ticket', '>', 0];
    } else if (result.length === 1) {
      result = item;
    }

    if (result[0] === 'AND' || result[0] === 'OR') {
      result.shift();
    }

    return result;
  }

  _compileConditionQuery(value, op) {
    if (op.indexOf('IN') >= 0) {
      value = value instanceof Array ? value : [value];
    }

    return value;
  }

  static _exprParse(string, start = 0) {
    let result = [];
    let val = '';
    let len = string.length;
    let i;
    let subArr;
    let char;

    for (i = start; i < len; i++) {
      char = string[i];
      if (char === '(') {
        if (val) {
          result.push(val);
          val = '';
        }
        [i, subArr] = this._exprParse(string, i + 1);
        result.push(subArr);
      } else if (char === ')') {
        if (val) {
          result.push(val);
          val = '';
        }
        break;
      } else if (/[+-/*]+/.test(char)) {
        if (val) {
          result.push(val);
          val = '';
        }
        result.push(char);
      } else if (char !== ' ') {
        val += char;
      }
    }
    if (val) {
      result.push(val);
    }
    return start === 0 ? result : [i, result];
  }

  asArray(key) {
    if (key) {
      return this._result.map(row => row[key]);
    }

    return this._result;
  }

  asMap(key, value = null) {
    return this._result.reduce((map, row) => {
      map[row[key]] = value ? row[value] : row;
      return map;
    }, {});
  }

  get(name, defaultValue = null) {
    const row = this.first();

    return (row && row[name] !== undefined) ? row[name] : defaultValue;
  }

  first() {
    return (this._result[0] !== undefined) ? this._result[0] : this._result;
  }

  static expr(string) {
    return this._exprParse(string);
  }
}

module.exports = Search;
