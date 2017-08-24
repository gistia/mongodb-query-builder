const OPERATORS = {
  eq:       { op: '$eq' },
  ne:       { op: '$ne' },
  contains: { op: '$regex', options: { $options: 'i' } },
  lt:       { op: '$lt' },
  lte:      { op: '$lte' },
  gt:       { op: '$gt' },
  gte:      { op: '$gte' },
};

const FILTERS_KEYWORDS = ['page', 'limit', 'sort'];

const getFilters = (query) => {
  return Object.keys(query)
    .filter(key => !FILTERS_KEYWORDS.includes(key))
    .reduce((acc, key) => {
      const field = key.split('.');
      const filterOperator = Object.keys(OPERATORS).includes(field[field.length - 1]) ? field.pop() : 'eq';
      const { op, options } = OPERATORS[filterOperator];
      const filter = { [op]: query[key] };
      if (options) Object.assign(filter,  options);
      return Object.assign(acc, { [field.join('.')]: filter });
    }, {});
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
