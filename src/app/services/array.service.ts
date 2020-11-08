import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArrayService {

  constructor() { }

  addToArray(originalArray, newArray) {
    originalArray.push.apply(originalArray, newArray);
  }

  refreshArray(originalArray, newArray) {
    this.emptyArray(originalArray);
    this.addToArray(originalArray, newArray);
  }

  emptyArray(originalArray) {
    originalArray.length = 0;
  }

  removeFromArray(originalArray, element) {
    const indexOf = originalArray.indexOf(element);
    if (indexOf < 0) {
      console.debug('No element found!');
      return;
    }
    originalArray.splice(indexOf, 1);
  }

  cloneArray(originalArray): any[] {
    return originalArray.slice();
  }

  getChangedFields(changedObject, originalObject): any {
    const changedFields = {};
    for (const key in changedObject) {
      if (changedObject.hasOwnProperty(key)) {
        const value = changedObject[key];
        if (!this.isSame(value, originalObject[key])) {
          changedFields[key] = value;
        }
      }
    }
    return changedFields;
  }

  isSame(field1, field2): boolean {
    const normalized1 = field1 === '' || field1 === null ? undefined : field1;
    const normalized2 = field2 === '' || field2 === null ? undefined : field2;
    return normalized1 === normalized2;
  }
}
