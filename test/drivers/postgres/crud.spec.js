const proxyquire = require('proxyquire');
const {suite} = require('suitape');
const MockExecuteSql = require('./../../test-helpers/mocks/execute-sql');

const Crud = proxyquire('./../../../lib/drivers/postgres/crud', {'./execute-sql': MockExecuteSql.build()});
const driver = {engine: 'postgres', connection: {pool: {}}};
const {types, defineSchema} = require('./../../../lib/schema/definition');
const schema = defineSchema('single_table', driver, {
  name: types.STRING,
  lastName: types.STRING,
  age: types.INTEGER,
  tracked: types.BOOLEAN,
  job: types.JSON,
  createdAt: types.DATE
});

suite('Postgres Crud', (test) => {
  test('findOne: should return promise', (assert) => {
    const crud = Crud(driver, schema);
    const actual = crud.findOne({name: 'Jon'}).constructor.name;
    const expected = 'Promise';
    assert('equal', actual, expected);
  });

  test('findOne: should return select statement', (assert) => new Promise((resolve) => {
    const crud = Crud(driver, schema);

    crud.findOne({name: 'Jon'})
      .then(sql => {
        const expected = true;
        const actual = sql.includes('SELECT');
        assert('equal', actual, expected);
        resolve();
      });
  }));

  test('findOne: should return select statement and include all fields', (assert) => new Promise((resolve) => {
    const crud = Crud(driver, schema);

    crud.findOne({name: 'Jon', lastName: 'Doe', age: 23})
      .then(sql => {
        const expected = true;
        ['SELECT * FROM', 'name', 'last_name', 'age'].forEach(field => {
          const actual = sql.includes(field);
          assert('equal', actual, expected);
        });
        resolve();
      });
  }));

  test('insert: should return promise', (assert) => {
    const crud = Crud(driver, schema);
    const actual = crud.insert({name: 'Jon'}).constructor.name;
    const expected = 'Promise';
    assert('equal', actual, expected);
  });

  test('insert: should return insert into statement', (assert) => new Promise((resolve) => {
    const crud = Crud(driver, schema);
    crud.insert({name: 'Jon'}).then(sql => {
      const expected = true;
      const actual = sql.includes('INSERT INTO');
      assert('equal', actual, expected);
      resolve();
    });
  }));

  test('findOne: should return insert into statement and include all fields', (assert) => new Promise((resolve) => {
    const crud = Crud(driver, schema);
    crud.insert({name: 'Jon', lastName: 'Doe', age: 23})
      .then(sql => {
        const expected = true;
        ['INSERT INTO', 'name', 'last_name', 'age'].forEach(field => {
          const actual = sql.includes(field);
          assert('equal', actual, expected);
        });
        resolve();
      });
  }));
});
