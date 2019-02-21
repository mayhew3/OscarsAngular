const model = require('./model');
const _ = require('underscore');

exports.getCategories = function(request, response) {
  model.Category.findAll({
    order:
      [
        ['points', 'DESC'],
        ['name', 'ASC']
      ]
  }).then(categories => {
    model.Nomination.findAll({
      where: {
        year: request.query.year
      }
    }).then(nominations => {
      let outputObject = [];

      model.Vote.findAll({
        where: {
          person_id: request.query.person_id,
          year: request.query.year
        }
      }).then(votes => {

        _.forEach(categories, function(category) {
          let cat_noms = _.where(nominations, {category_id: category.id});
          let cat_votes = _.where(votes, {category_id: category.id});

          if (cat_votes.length > 1) {
            throw new Error("Multiple votes found for category " + category.id);
          }

          let category_object = category.dataValues;

          if (cat_votes.length > 0) {
            category_object.voted_on = cat_votes[0].dataValues.nomination_id;
          }

          category_object.nominees = cat_noms;

          outputObject.push(category_object);
        });

        response.json(outputObject);
      });
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
