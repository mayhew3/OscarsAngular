import _ from 'underscore';
import {socketServer} from '../www';
import {getRepository} from 'typeorm';
import {Person} from '../typeorm/Person';
import {PersonGroupRole} from '../typeorm/PersonGroupRole';


export const getPersons = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const connectedIds = socketServer.getConnectedPersons();

  const persons = await getRepository(Person).find();
  const personGroupRoles = await getRepository(PersonGroupRole).find();
  const outputObject = [];

  _.forEach(persons, person => {
    const person_groups = _.where(personGroupRoles, {person_id: person.id});
    const person_group_ids = _.pluck(person_groups, 'person_group_id');
    const person_object = JSON.parse(JSON.stringify(person));
    person_object.groups = person_group_ids;
    person_object.connected = _.contains(connectedIds, person.id);

    outputObject.push(person_object);
  });

  response.json(outputObject);
};

export const updatePerson = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const person = request.body;

  try {
    await getRepository(Person).update(person.id, person);
    response.json({msg: 'Success!'});
  } catch(err) {
    console.error(err);
    response.send({msg: 'Error updating nominee: ' + JSON.stringify(person)});
  }
};
