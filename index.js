const OPERATORS = {
  eq:       { op: '$eq' },
  ne:       { op: '$ne' },
  contains: { op: '$regex', options: { $options: 'i' } },
  lt:       { op: '$lt' },
  lte:      { op: '$lte' },
  gt:       { op: '$gt' },
  gte:      { op: '$gte' },
};

const LOG_OPERATORS = {
  and: '$and',
  or: '$or',
};

const FILTERS_KEYWORDS = ['page', 'limit', 'sort', 'op'];

const castValues = (value) => {
  if (value === 'null') {
    return null;
  } else {
    return value;
  }
};

const getFilters = (query) => {
  const operator = getOperator(query);
  return Object.keys(query)
    .filter(key => !FILTERS_KEYWORDS.includes(key))
    .reduce((acc, key) => {
      const field = key.split('.');
      const filterOperator = Object.keys(OPERATORS).includes(field[field.length - 1]) ? field.pop() : 'eq';
      const { op, options } = OPERATORS[filterOperator];
      const filter = { [op]: castValues(query[key]) };
      if (options) { Object.assign(filter,  options) };
      acc[operator].push({ [field.join('.')]: filter })
      return acc;
    }, { [operator] : [] });
};

const getPagination = (query) => {
  if (query.limit === 'null') {
    return undefined;
  }

  const page = Number(query.page || 1);
  const pageSize = Number(query.limit || 10);

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
};

const getSort = (query) => (
  query.sort ? transformSort(query.sort.split(',')) : undefined
);

const getOperator = (query) => {
  const { op='and' } = query;
  return LOG_OPERATORS[op] ? LOG_OPERATORS[op] : LOG_OPERATORS.and;
};

const transformSort = (sort) => {
  const regex = /^(.*?)(?:\s(ASC|DESC))?$/;
  if (!sort) {
    return {};
  }
  return sort.reduce((hash, term) => {
    const re = regex.exec(term);
    const field = re[1].trim();
    const order = (re[2] || 'ASC').toUpperCase() === 'ASC' ? 1 : -1;
    hash[field] = order;
    return hash;
  }, {});
};

class QueryBuilder {
  static build(query) {
    const filters = getFilters(query);
    const pagination = getPagination(query);
    const sort = getSort(query);

    return {
      pagination,
      filters,
      sort,
    };
  }
}

module.exports = QueryBuilder;
