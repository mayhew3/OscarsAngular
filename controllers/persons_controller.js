const model = require('./model');
const _ = require('underscore');

exports.getPersons = function(request, response) {
  model.Person.findAll().then(persons => {
    model.PersonGroupRole.findAll().then(personGroupRoles => {
      let outputObject = [];

      _.forEach(persons, function(person) {
        let person_groups = _.where(personGroupRoles, {person_id: person.id});
        let person_group_ids = _.pluck(person_groups, 'person_group_id');
        let person_object = person.dataValues;
        person_object.groups = person_group_ids;

        outputObject.push(person_object);
      });

      response.json(outputObject);
    });
  });
};

exports.updatePerson = async function(request, response) {
  let person = request.body;

  let result;
  try {
    result = await model.Person.findByPk(person.id);
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error finding'});
  }

  try {
    await result.update(person);
    response.json({msg: "Success!"});
  } catch(err) {
    console.error(err);
    response.send({msg: "Error updating nominee: " + JSON.stringify(person)});
  }
};
