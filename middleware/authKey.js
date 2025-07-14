/**
 * Middleware to authenticate protected routes using a key
 */

module.exports = (req, res, next) => {

    // get the submitted key from the request header
    const key = req.headers['x-post-key'];

    // verify the key, if it doesn't match deny the req
    if(!key || key !== process.env.POST_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized access.' });
    }

    // if the key matches, allow the request to proceed
    next();
}