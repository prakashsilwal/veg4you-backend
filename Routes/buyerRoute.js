const express = require("express");
const router = express.Router();
const Buyer = require("../models/Buyer");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const authorization = require("../middleware/authentication");

//add buyer
router.post(
  "/buyer/upload",
  [
    check("fullname", "Enter your fullname name").not().isEmpty(),
    check("email", "Please enter a proper email").isEmail(),
    check(
      "password",
      "Please enter a password with more than 6 characters"
    ).isLength({ min: 6 }),
    check("phoneNumber", "please enter a proper phone number").isMobilePhone(),
    check("address", "Please enter your address").not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array()[0].msg);
      res.status(400).json({
        message: errors.array()[0].msg,
      });
    } else {
      Buyer.findOne({ email: req.body.email })
        .then((user) => {
          if (user) {
            res.status(403).json({
              message: `User with email ${req.body.email} already exist..`,
            });
          } else {
            const fullname = req.body.fullname;
            const email = req.body.email;
            const password = req.body.password;
            const phoneNumber = req.body.phoneNumber;
            const address = req.body.address;

            bcrypt.hash(password, 10, function (error, hash) {
              //password encryption
              var myData = new Buyer({
                fullname: fullname,
                email: email,
                password: hash,
                phoneNumber: phoneNumber,
                address: address,
              });
              myData
                .save()
                .then(() => {
                  //success insert

                  res.status(201).json({ message: "Registered success!!" });
                })

                .catch(function (e) {
                  res.status(500).json({ message: e });
                });
            });
          }
        })
        .catch((err) => {
          res.status(500).json({ message: err });
        });
    }
  }
);

// login------
router.post(
  "/buyer/login",

  [
    check("email", "Please enter a proper email").isEmail(),
    check(
      "password",
      "Please enter a password with more than 6 characters"
    ).isLength({ min: 6 }),
  ],

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array()[0].msg);
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    Buyer.findOne({ email: req.body.email })
      .then(function (myData) {
        if (myData === null) {
          //killing the code not giving further access
          return res
            .status(403)
            .json({ message: `user not found with email ${req.body.email}` });
        }
        bcrypt.compare(
          req.body.password,
          myData.password,
          function (err, result) {
            if (result === false) {
              return res
                .status(404)
                .json({ message: "password is incorrect.." });
            }
            //generating token
            const token = jwt.sign({ buyerID: myData._id }, "secretkey");
            res.status(200).json({
              message: "Logged In Successfully",
              success: true,
              //used in sessioning
              token: token,
            });
          }
        );
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  }
);

//Update Buyer
router.put(
  "/update/buyer/:bid",
  authorization.verifyBuyer,
  function (req, res) {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    const phoneNumber = req.body.phoneNumber;
    const address = req.body.address;
    const id = req.params.bid;

    Buyer.updateOne(
      { _id: id },
      {
        fullname: fullname,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        address: address,
      }
    )

      .then(function (result) {
        res.status(200).json("Buyer Updated!!");
      })
      .catch(function (error) {
        console.log(error.message);
        res.status(400).json({ message: "Buyer unable to update!!" });
      });
  }
);

//get buyer profile by auth token
router.get(
  "/buyer/profileByToken",
  authorization.getBuyerProfile,
  (req, res) => {
    res.status(200).json(req.user);
  }
);

//delete buyer by admin
router.delete("/seller/:sid", authorization.getSellerProfile, (req, res) => {
  if (req.user.admin) {
    let id = req.params.sid;
    Buyer.findByIdAndDelete(id)
      .then(() => {
        res.status(200).json({ message: "Buyer deleted Successfully" });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  } else {
    res.status(400).json({ message: "Only admin can delete this resource" });
  }
});

//get all buyer users for admin
router.get(
  "/buyer/admin/getallUsers",
  authorization.getSellerProfile,
  (req, res) => {
    if (req.user.admin) {
      Buyer.find()
        .then((user) => {
          res.status(200).json(user);
        })
        .catch((err) => {
          res.status(400).json({ message: err.message });
        });
    } else {
      res.status(400).json({ message: "Only admin can access this resource" });
    }
  }
);

module.exports = router;
