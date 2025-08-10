const tripsEndpoint = 'https://cs465.csdad.us/api/trips';
const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}


/* GET travel page for CS465 */
const travel = async(req, res, next) => {

  await fetch(tripsEndpoint, options)
    .then((fetchRes) => fetchRes.json()) 
    .then((data) => {
      let message = null;

      if (!(data instanceof Array)) { 
        message = "API lookup error: Expected an array of trips.";
        data = [];
      } else if (!data.length) {
        message = "No trips found.";
      }

      res.render('travel', {
        title: 'Travel',
        trips: data,
        message
      });
    })
    .catch((error) => {
      res.status(500).send(error.message);
      console.error('Error fetching trips:', error);
    });

}

module.exports = {
  travel
};

