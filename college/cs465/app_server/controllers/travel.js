const fs = require('fs');
const trips = JSON.parse(fs.readFileSync('./college/cs465/app_server/data/trips.json', 'utf8'));


/* GET travel page for CS465 */
const travel = (req, res) => {
  res.render('travel', { title: "Travlr Gateways", trips });
}

module.exports = {
  travel
};
