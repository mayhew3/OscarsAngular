const model = require('./model');
const _ = require('underscore');

exports.getCategories = function(request, response) {
  model.Category.findAll().then(categories => {
    model.Nomination.findAll({
      where: {
        year: 2018
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

exports.updateNomination = function(request, response) {
  let nomination = request.body;

  model.Nomination.findByPk(nomination.id).then(result => {
    result.update(nomination).then(() => {
      response.json({msg: "Success!"});
    }).catch(error => {
      console.error(error);
      response.send({msg: "Error updating nominee: " + JSON.stringify(nomination)})
    });
  }).catch(error => {
    console.error(error);
    response.send({msg: "Error finding nomination: " + error});
  });
};
