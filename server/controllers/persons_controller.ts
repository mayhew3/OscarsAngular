import * as model from './model';
import _ from 'underscore';

export const getPersons = (request, response) => {
  model.Person.findAll().then(persons => {
    model.PersonGroupRole.findAll().then(personGroupRoles => {
      const outputObject = [];

      _.forEach(persons, person => {
        const person_groups = _.where(personGroupRoles, {person_id: person.id});
        const person_group_ids = _.pluck(person_groups, 'person_group_id');
        const person_object = person.dataValues;
        person_object.groups = person_group_ids;

        outputObject.push(person_object);
      });

      response.json(outputObject);
    });
  });
};

export const updatePerson = async (request, response) => {
  const person = request.body;

  let result;
  try {
    result = await model.Person.findByPk(person.id);
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error finding'});
  }

  try {
    await result.update(person);
    response.json({msg: 'Success!'});
  } catch(err) {
    console.error(err);
    response.send({msg: 'Error updating nominee: ' + JSON.stringify(person)});
  }
};
