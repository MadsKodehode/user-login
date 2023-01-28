const jwt = require("jsonwebtoken");
const User = require("../db/userModel");
require("dotenv").config();
const handleRefresh = async (req, res) => {
  //Get refresh token from httpOnly cookie
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  //Store refresh token
  const refreshToken = cookies.jwt;

  //Find User in db
  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) return res.sendStatus(403);

  //Verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    //Check if error or user id from db is not same as refresh token id decoded
    if (err || foundUser.email !== decoded.userEmail)
      return res.sendStatus(403);

    const accessToken = jwt.sign(
      { userId: decoded.userId, userEmail: decoded.userEmail },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });
};

module.exports = handleRefresh;
