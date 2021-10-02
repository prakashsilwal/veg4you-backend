const jwt = require("jsonwebtoken");
const Buyer = require("../models/Buyer");
const Seller = require("../models/Seller");

module.exports.verifyBuyer = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodeData = jwt.verify(token, "secretkey");
    Buyer.findOne({ _id: decodeData.buyerID })
      .then(function (result) {
        req.buyer = result;
        next();
      })
      .catch(function (error) {
        res.status(401).json({ message: error });
      });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized access!!" });
  }
};

module.exports.verifySeller = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodeData = jwt.verify(token, "secretkey");
    Seller.findOne({ _id: decodeData.sellerID })
      .then(function (result) {
        req.seller = result;
        next();
      })
      .catch(function (error) {
        res.status(401).json({ message: error });
      });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized access!!" });
  }
};

//get profile of seller user
module.exports.getSellerProfile = (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: "Auth token not found !!!!!" });
  }
  let token = authHeader.split(" ")[1];

  let data;
  try {
    data = jwt.verify(token, "secretkey");
  } catch (err) {
    res.status(400).json({ message: "Auth token not valid" });
  }
  Seller.findById(data.sellerID).then((user) => {
    req.user = user;
    next();
  });
};

//get profile of buyer user
module.exports.getBuyerProfile = (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: "Auth token not found !!!!!" });
  }
  let token = authHeader.split(" ")[1];

  let data;
  try {
    data = jwt.verify(token, "secretkey");
  } catch (err) {
    res.status(400).json({ message: "Auth token not valid" });
  }

  Buyer.findById(data.buyerID).then((user) => {
    req.user = user;
    next();
  });
};
