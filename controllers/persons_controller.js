const model = require('./model');
const _ = require('underscore');
const Sequelize = require('sequelize');

exports.getPersons = function(request, response) {
  model.Person.findAll({
    where: {
      email: {
        [Sequelize.Op.like]: '%@gmail.com'
      }
    }
  }).then(persons => {
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
