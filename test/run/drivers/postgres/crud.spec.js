const proxyquire = require('proxyquire');
const {suite} = require('suitape');
const MockExecuteSql = require('test/test-helpers/mocks/execute-sql');

const Crud = proxyquire('lib/drivers/postgres/crud', {'./execute-sql': MockExecuteSql.build()});
const driver = {engine: 'postgres', connection: {pool: {}}};
const schema = require('test/test-helpers/build-single-table-schema')(driver);
const BAD_INPUT = 'BAD_INPUT';

suite('Postgres Crud', (test) => {
  const crud = Crud(driver, schema);

  test('findOne: should return promise', (assert) => {
    const actual = crud.findOne({where: {name: 'Jon'}}).constructor.name;
    const expected = 'Promise';
    assert('equal', actual, expected);
  });

  test('findOne: should return error if unknown fields are sent', assert => {
    return new Promise((resolve, reject) => {
      crud.findOne({where: {unknown: 'field'}})
        .then(reject)
        .catch(err => {
          assert('equal', err.name, BAD_INPUT);
        })
        .then(resolve);
    });
  });

  test('findOne: should not return error if operators are sent', assert => {
    return new Promise((resolve, reject) => {
      crud.findOne({where: {and: [{name: 'Jon'}, {lastName: 'Doe'}]}})
        .then(resolve)
        .catch(err => {
          console.error(err);
          reject();
        });
    });
  });

  test('findOne: should return select statement', assert => {
    return new Promise((resolve, reject) => {
      crud.findOne({where: {name: 'Jon'}})
        .then(sql => {
          const expected = true;
          const actual = sql.includes('SELECT');
          assert('equal', actual, expected);
        })
        .then(resolve)
        .catch(reject);
    });
  });

  test('findOne: should return select statement and include all fields', assert => {
    return new Promise((resolve, reject) => {
      crud.findOne({where: {name: 'Jon', lastName: 'Doe', age: 23}})
        .then(sql => {
          const expected = true;
          ['SELECT * FROM', 'name', 'last_name', 'age'].forEach(field => {
            const actual = sql.includes(field);
            assert('equal', actual, expected);
          });
        })
        .then(resolve)
        .catch(reject);
    });
  });

  test('insert: should return promise', assert => {
    const actual = crud.insert({name: 'Jon'}).constructor.name;
    const expected = 'Promise';
    assert('equal', actual, expected);
  });

  test('insert: should return error when trying to insert unkown field', assert => {
    return new Promise((resolve, reject) => {
      crud.insert({unknown: 'Field'})
        .then(reject)
        .catch(err => assert('equal', err.name, BAD_INPUT))
        .then(resolve)
        .catch(reject);
    });
  });

  test('insert: should return insert into statement', assert => {
    return new Promise((resolve, reject) => {
      crud.insert({name: 'Jon'}).then(sql => {
        const expected = true;
        const actual = sql.includes('INSERT INTO');
        assert('equal', actual, expected);
      })
      .then(resolve)
      .catch(reject);
    });
  });

  test('insert: should return insert into statement and include all fields', assert => {
    return new Promise((resolve, reject) => {
      crud.insert({name: 'Jon', lastName: 'Doe', age: 23})
        .then(sql => {
          const expected = true;
          ['INSERT INTO', 'name', 'last_name', 'age'].forEach(field => {
            const actual = sql.includes(field);
            assert('equal', actual, expected);
          });
        })
        .then(resolve)
        .catch(reject);
    });
  });

  test('update: should return update statement', (assert) => new Promise((resolve) => {
    crud.update({name: 'Jon'}, {lastName: 'Doe'})
      .then(sql => {
        const expected = true;
        ['UPDATE', 'SET', 'name', 'last_name'].forEach(field => {
          const actual = sql.includes(field);
          assert('equal', actual, expected);
        });
      })
      .then(resolve)
      .catch(resolve);
  }));
});
