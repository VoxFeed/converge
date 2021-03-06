const {types, defineModel} = require('lib/model/definition');

const collection = 'employees';
const definition = {
  personId: types.FOREIGN_KEY,
  schedule: types.STRING,
  entryDate: types.DATE,
  ssn: types.STRING
};

module.exports = (engine, PersonModel) => {
  const model = defineModel(Object.assign({}, {collection, definition, engine}));
  model.extend(PersonModel, 'personId');
  model.unique({single: ['ssn']});
  model.setPrimaryKey('personId');
  return model;
};
