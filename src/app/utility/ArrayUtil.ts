import _ from 'underscore';

export class ArrayUtil {
  static removeFromArray<T>(originalArray: T[], element: T): void {
    const indexOf = originalArray.indexOf(element);
    if (indexOf < 0) {
      console.debug('No element found!');
      return;
    }
    originalArray.splice(indexOf, 1);
  }

  static removeMultipleFromArray(originalArray: any[], elements: any[]): void {
    elements.forEach(element => this.removeFromArray(originalArray, element));
  }

  static cloneArray<T>(originalArray: T[]): T[] {
    return originalArray.slice();
  }

  static addToArray<T>(originalArray: T[], newArray: T[]): void {
    if (!Array.isArray(newArray)) {
      console.error('Using addToArray to add non-array type to an array. This method is only intended ' +
        'to combine arrays. Use the push(element) method on the array to do this instead.');
    }
    originalArray.push.apply(originalArray, newArray);
  }

  static refreshArray<T>(originalArray: T[], newArray: T[]): void {
    this.emptyArray(originalArray);
    this.addToArray(originalArray, newArray);
  }

  static emptyArray<T>(originalArray: T[]): void {
    originalArray.length = 0;
  }

  static sum(numbers: number[]): number {
    return _.reduce(numbers, (m, n) => m + n);
  }

  static average(numbers: number[]): number {
    const total = _.reduce(numbers, (m, n) => m + n);
    return total / numbers.length;
  }
}
