const QueryBuilder = require('./index');
const expect = require('chai').expect;

describe('Query Builder', () => {
  describe('pagination', () => {
    it('selects pagination', () => {
      const query = { page: 1, limit: 2 };

      const result = QueryBuilder.build(query).pagination;
      const expected = { offset: 0, limit: 2 };

      expect(result).to.eql(expected);
    });

    it('calculates the page offset', () => {
      const query = { page: 2, limit: 5 };

      const result = QueryBuilder.build(query).pagination;
      const expected = { offset: 5, limit: 5 };

      expect(result).to.eql(expected);
    });

    it('paginates by default', () => {
      const query = {};

      const result = QueryBuilder.build(query).pagination;
      const expected = { offset: 0, limit: 10 };

      expect(result).to.eql(expected);
    });

    it('returns no pagination', () => {
      const query = { page: 1, limit: 'null' };

      const result = QueryBuilder.build(query).pagination;
      const expected = undefined;

      expect(result).to.eql(expected);
    });
  });

  describe('no filters', function() {
    it('does not create an empty array', () => {
      const query = { };

      const result = QueryBuilder.build(query).filters;
      const expected = { };

      expect(result).to.eql(expected);
    });
  });

  describe('filters', () => {
    it('selects filters case sensitve', () => {
      const query = { 'Person.FirstName.eq': 'John', 'Person.LastName.eq': 'Snow' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and : [{ 'Person.FirstName': { $eq: 'John' } },{ 'Person.LastName': { $eq: 'Snow' } }] };

      expect(result).to.eql(expected);
    });

    it('discards parginate filters', () => {
      const query = { 'firstName.eq': 'John', page: 1, limit: 10 };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ {firstName: { $eq: 'John' }} ] };
      expect(result).to.eql(expected);
    });

    it('discards sort filters', () => {
      const query = { 'firstName.eq': 'John', sort: 'Status' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{firstName: { $eq: 'John' }}] };

      expect(result).to.eql(expected);
    });

    it('selects filters', () => {
      const query = { 'firstName.eq': 'John', 'lastName.eq': 'Snow' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and:[ {firstName: { $eq: 'John' }}, {lastName: { $eq: 'Snow' }} ]};

      expect(result).to.eql(expected);
    });

    it('adds eq operation as default', () => {
      const query = { firstName: 'John', lastName: 'Snow' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ {firstName: { $eq: 'John' }}, {lastName: { $eq: 'Snow' }} ] };

      expect(result).to.eql(expected);
    });

    it('receives eq operation multiple values', () => {
      const query = { 'firstName.eq': [ 'John', 'Doe' ] };

      const result = QueryBuilder.build(query).filters;
      const expected = {
        $and: [
          {firstName: { $eq: 'John' }},
          {firstName: { $eq: 'Doe' }}
        ]
      };

      expect(result).to.eql(expected);
    });


    it('receives ne operation multiple values', () => {
      const query = { 'firstName.ne': ['oh', 'no'] };

      const result = QueryBuilder.build(query).filters;
      const expected = {
        $and: [
          {firstName: { $ne: 'oh' }},
          {firstName: { $ne: 'no' }}
        ]
      };

      expect(result).to.eql(expected);
    });

    it('receives ne operation single value', () => {
      const query = { 'firstName.ne': 'oh' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{firstName: { $ne: 'oh' }}]  };

      expect(result).to.eql(expected);
    });

    it('receives lt operation', () => {
      const query = { 'firstName.lt': 'oh' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{ firstName: { $lt: 'oh' } }]  };

      expect(result).to.eql(expected);
    });

    it('receives lte operation', () => {
      const query = { 'firstName.lte': 'oh' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{firstName: { $lte: 'oh' }}]  };

      expect(result).to.eql(expected);
    });

    it('receives gt operation', () => {
      const query = { 'Person.firstName.gt': 'oh' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and : [{ 'Person.firstName': { $gt: 'oh' } }] };

      expect(result).to.eql(expected);
    });

    it('receives gte operation', () => {
      const query = { 'Person.firstName.gte': 'oh' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ { 'Person.firstName': { $gte: 'oh' } } ] };

      expect(result).to.eql(expected);
    });

    it('receives in operation with null element', () => {
      const query = { 'Person.firstName.in': 'null' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ { 'Person.firstName': { $in: [ null ] } } ] };

      expect(result).to.eql(expected);
    });

    it('receives in operation with miltiples values including null', () => {
      const query = { 'Person.firstName.in': 'oh,my,null,god' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ { 'Person.firstName': { $in: [ 'oh', 'my', null, 'god' ] } } ] };

      expect(result).to.eql(expected);
    });



    it('receives in operation with single elements', () => {
      const query = { 'Person.firstName.in': 'oh' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ { 'Person.firstName': { $in: [ 'oh' ] } } ] };

      expect(result).to.eql(expected);
    });

    it('receives in operation with multiples elements', () => {
            const query = { 'Person.firstName.in': 'oh,my,god' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ { 'Person.firstName': { $in: [ 'oh', 'my', 'god' ] } } ] };

      expect(result).to.eql(expected);
    });

    it('receives exists operation', () => {
      const query = { 'firstName.exists': 'true' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{firstName: { $exists: true }}]  };

      expect(result).to.eql(expected);
    });

    it('receives exists operation with an invalid value', () => {
      const query = { 'firstName.exists': 'any-invalid-value' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{firstName: { $exists: false }}]  };

      expect(result).to.eql(expected);
    });

    it('receives eqInt operation', () => {
      const query = { 'age.eqInt': '33' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{age: { $eq: 33 }}]  };

      expect(result).to.eql(expected);
    });

    it('receives eqInt with a invalid number', () => {
      const query = { 'age.eqInt': '47xpto' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{age: { $eq: '47xpto' }}]  };

      expect(result).to.eql(expected);
    });

    it('receives eqInt with null values', () => {
      const query = { 'age.eqInt': 'null', 'fingersCount.eq': null };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [{age: { $eq: null }}, {fingersCount: {$eq: null}}]  };

      expect(result).to.eql(expected);
    });

    it('receives contains operation', () => {
      const query = { 'Person.firstName.contains': 'oh' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and: [ { 'Person.firstName': { $regex: 'oh', $options: 'i' } } ] };

      expect(result).to.eql(expected);
    });

    it('converts null string into null', () => {
      const query = { 'Person.firstName.eq': 'null' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and : [ { 'Person.firstName': { $eq: null } } ] };

      expect(result).to.eql(expected);
    });

    it('converts null string into null event inside arrays', () => {
      const query = { 'Person.firstName.eq': [ 'null' ] };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and : [ { 'Person.firstName': { $eq: null } } ] };

      expect(result).to.eql(expected);
    });

    it('uses or operator', function() {
      const query = { 'Person.firstName.eq': 'null', _op: 'or' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $or : [ { 'Person.firstName': { $eq: null } } ] };

      expect(result).to.eql(expected);
    });

    it('sends invalid operator then uses $and', function() {
      const query = { 'Person.firstName.eq': 'null', _op: 'xor' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and : [ { 'Person.firstName': { $eq: null } } ] };

      expect(result).to.eql(expected);
    });

    it('converts string into date', function() {
      const query = { 'CreatedAt': '2017-08-22T20:33:32.780Z' };

      const result = QueryBuilder.build(query).filters;
      const expected = { $and : [ { 'CreatedAt': { $eq: new Date(Date.parse('2017-08-22T20:33:32.780Z' )) } } ] };

      expect(result).to.eql(expected);
    });
  });

  describe('sort', () => {
    it('selects sort', () => {
      const query = { sort: 'OrderId' };

      const result = QueryBuilder.build(query).sort;
      const expected = { OrderId:  1 };

      expect(result).to.eql(expected);
    });

    it('selects descending sort', () => {
      const query = { sort: 'OrderId DESC' };

      const result = QueryBuilder.build(query).sort;
      const expected = { OrderId: -1 };

      expect(result).to.eql(expected);
    });

    it('selects multiple sorts', () => {
      const query = { sort: 'OrderId DESC, Something' };

      const result = QueryBuilder.build(query).sort;
      const expected = { OrderId: -1, Something: 1 };

      expect(result).to.eql(expected);
    });

    it('returns undefined no sort', () => {
      const query = {};

      const result = QueryBuilder.build(query).sort;

      expect(result).to.be.undefined;
    });
  });

  describe('fields', function() {
    it('selects single field', () => {
      const query = { _fields: 'OrderId' };

      const result = QueryBuilder.build(query).fields;
      const expected = { OrderId:  1 };

      expect(result).to.eql(expected);
    });

    it('selects multiple fields', () => {
      const query = { _fields: 'OrderId, Name' };

      const result = QueryBuilder.build(query).fields;
      const expected = { OrderId:  1, Name: 1 };

      expect(result).to.eql(expected);
    });

    it('return undefined when no fields', function() {
      const query = {};

      const result = QueryBuilder.build(query).fields;
      const expected = undefined;

      expect(result).to.eql(expected);
    });
  });
});
