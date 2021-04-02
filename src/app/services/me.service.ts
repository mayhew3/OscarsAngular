import { Injectable } from '@angular/core';
import {PersonService} from './person.service';

@Injectable({
  providedIn: 'root'
})
export class MeService {

  me$ = this.personService.me$;

  constructor(private personService: PersonService) { }
}
