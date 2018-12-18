const model = require('./model');

exports.getCategories = function(request, response) {
  model.Category.findAll().then(categories => {
    response.json(categories);
  });
};

exports.getNominations = function(request, response) {
  console.log("Getting nominations for category id: " + request.query.category_id);
  model.Nomination.findAll({
    where: {
      category_id: request.query.category_id,
      year: 2017
    }
  }).then(function(nominations) {
    console.log("Found results: " + JSON.stringify(nominations));
    response.json(nominations);
  });
};
