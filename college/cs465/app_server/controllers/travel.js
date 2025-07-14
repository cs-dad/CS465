/* GET travel page for CS465 */
const travel = (req, res) => {
  res.render('travel', { title: "Travlr Gateways" });
}

module.exports = {
  travel
};
