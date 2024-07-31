const jwt = require('jsonwebtoken');
const secrets = require('../../config/secret.js'); 

module.exports = (req, res, next) => {
  const token = req.headers.authorization

	if (!token) {
		return res.status(401).json({ message: "token required" });
	}

	jwt.verify(token, secrets.jwtSecret, (err, decoded) => {
		if (err) {
			return res.status(401).json({ message: "token invalid" });
		}
		// Save the decoded payload to request for use in other routes
		req.user = decoded;
		next();
	});

  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.
      

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};
