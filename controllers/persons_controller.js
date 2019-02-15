const model = require('./model');
const _ = require('underscore');

exports.getCategories = function(request, response) {
  model.Category.findAll().then(categories => {
    model.Nomination.findAll({
      where: {
        year: 2017
      }
    }).then(nominations => {
      let outputObject = [];

      _.forEach(categories, function(category) {
        let cat_noms = _.where(nominations, {category_id: category.id});
        let category_object = category.dataValues;
        category_object.nominees = cat_noms;

        outputObject.push(category_object);
      });

      response.json(outputObject);
    });
  });
};
