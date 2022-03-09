import _ from 'underscore';
import {socketServer} from '../www';
import {getRepository} from 'typeorm';
import {Person} from '../typeorm/Person';
import {PersonGroupRole} from '../typeorm/PersonGroupRole';
import {PersonGroup} from '../typeorm/PersonGroup';
import {Person as PersonObj} from '../../src/app/interfaces/Person';
import {NextFunction, Request, Response} from 'express/ts4.0';


export const getPersons = async (request: Request, response: Response): Promise<void> => {
  const connectedIds = socketServer.getConnectedPersons();

  const persons = await getRepository(Person).find();
  const personGroupRoles = await getRepository(PersonGroupRole).find();
  const outputObject: PersonObj[] = [];

  _.forEach(persons, person => {
    const person_groups = _.where(personGroupRoles, {person_id: person.id});
    const person_group_ids = _.pluck(person_groups, 'person_group_id');
    const person_object: PersonObj = JSON.parse(JSON.stringify(person));
    person_object.groups = person_group_ids;
    person_object.connected = _.contains(connectedIds, person.id);

    outputObject.push(person_object);
  });

  response.json(outputObject);
};

export const getPersonGroups = async (request: Request, response: Response): Promise<void> => {
  const personGroups = await getRepository(PersonGroup).find();

  response.json(personGroups);
};

export const updatePerson = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  const person = request.body;

  try {
    await getRepository(Person).update(person.id, person);
    response.json({msg: 'Success!'});
  } catch(err) {
    next(err);
  }
};
