
/* GET HOMEPAGE FOR CS465 */
const index = (req, res) => {
  res.render('index', { title: "Travlr Gateways"});
}

module.exports = {
  index
};
