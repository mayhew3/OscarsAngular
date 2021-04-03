import _ from 'underscore';

export const addToArray = (originalArray, newArray) => {
  originalArray.push.apply(originalArray, newArray);
};

export const removeFromArray = (arr, element) => {
  const indexOf = arr.indexOf(element);
  if (indexOf < 0) {
    console.debug('No element found!');
    return;
  }
  arr.splice(indexOf, 1);
};

export const exists = object => !_.isUndefined(object) && !_.isNull(object);

const shouldCopy = propertyValue => !_.isArray(propertyValue);

export const shallowCopy = (sourceObj, destinationObj) => {
  for (const propertyName in sourceObj) {
    if (sourceObj.hasOwnProperty(propertyName)) {
      const originalProp = sourceObj[propertyName];
      if (shouldCopy(originalProp)) {
        destinationObj[propertyName] = originalProp;
      }
    }
  }
};
