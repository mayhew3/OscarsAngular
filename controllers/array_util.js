const _ = require('underscore');

exports.addToArray = function(originalArray, newArray) {
  originalArray.push.apply(originalArray, newArray);
};

exports.removeFromArray = function(arr, element) {
  const indexOf = arr.indexOf(element);
  if (indexOf < 0) {
    console.debug("No element found!");
    return;
  }
  arr.splice(indexOf, 1);
};

exports.exists = function(object) {
  return !_.isUndefined(object) && !_.isNull(object);
};

exports.shallowCopy = function(sourceObj, destinationObj) {
  for (let propertyName in sourceObj) {
    if (sourceObj.hasOwnProperty(propertyName)) {
      const originalProp = sourceObj[propertyName];
      if (shouldCopy(originalProp)) {
        destinationObj[propertyName] = originalProp;
      }
    }
  }
};

function shouldCopy(propertyValue) {
  return !_.isArray(propertyValue);
}
