
const path = require('path');


const redirect404 = (req, res, next) => {
    res.redirect('/404.html');
};

module.exports = redirect404;