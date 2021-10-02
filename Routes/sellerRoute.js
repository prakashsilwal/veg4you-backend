const express = require("express");
const router = express.Router();
const Seller = require("../models/Seller");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const authorization = require("../middleware/authentication");

//register seller
router.post(
  "/seller/upload",
  [
    check("fullname", "Enter your name").not().isEmpty(),
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
      res.status(400).json({
        message: errors.array()[0].msg,
      });
    } else {
      Seller.findOne({ email: req.body.email })
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

              var myData = new Seller({
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
                  console.log(e)
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

// login seller------

router.post(
  "/seller/login",
  [
    check("email", "Please enter a proper email").isEmail(),
    check(
      "password",
      "Please enter a password with more than 6 characters"
    ).isLength({ min: 6 }),
  ],

  function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array()[0].msg);
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    Seller.findOne({ email: req.body.email })
      .then(function (myData) {
        if (myData === null) {
          return res
            .status(403)
            .json({ message: `user not found with email ${req.body.email}` });
        } else if (!myData.verified) {
          return res
            .status(402)
            .json({ message: "User not verified please verify the user" });
        }

        bcrypt.compare(
          req.body.password,
          myData.password,
          function (err, result) {
            if (result === false) {
              return res.status(404).json({ message: "password is invalid!!" });
            }
            //username and password valid

            const token = jwt.sign({ sellerID: myData._id }, "secretkey");
            res.status(200).json({
              message: "login success",
              token: token,
            });
          }
        );
      })
      .catch();
  }
);

//get seller profile by auth token
router.get(
  "/seller/profileByToken",
  authorization.getSellerProfile,
  (req, res) => {
    res.status(200).json(req.user);
  }
);

//Update Seller
router.put(
  "/seller/:sid",
  [
    check("fullname", "Enter your name").not().isEmpty(),
    check("email", "Please enter a proper email").isEmail(),
    check("phoneNumber", "please enter a proper phone number").isMobilePhone(),
    check("address", "Please enter your address").not().isEmpty(),
  ],

  authorization.verifySeller,
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    const phoneNumber = req.body.phoneNumber;
    const address = req.body.address;
    const id = req.params.sid;

    Seller.updateOne(
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
        res.status(201).json("Seller Updated!!");
      })
      .catch(function (error) {
        res.status(500).json({ message: "Seller unable to update!!" });
      });
  }
);

//verify seller by admin
router.put(
  "/seller/verify/admin/:sid",
  authorization.getSellerProfile,
  (req, res) => {
    if (req.user.admin) {
      let id = req.params.sid;
      Seller.updateOne(
        { _id: id },
        {
          verified: true,
        }
      )
        .then(() => {
          res.status(200).json("Seller verified successfully");
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ message: err.message });
        });
    } else {
      res
        .status(400)
        .json({ message: "Only admin can verify the seller account" });
    }
  }
);

//delete seller by admin
router.delete(
  "/seller/delete/:sid",
  authorization.getSellerProfile,
  (req, res) => {
    if (req.user.admin) {
      let id = req.params.sid;
      Seller.findByIdAndDelete(id)
        .then(() => {
          res.status(200).json("Seller deleted Successfully");
        })
        .catch((err) => {
          res.status(400).json({ message: err.message });
        });
    } else {
      res.status(400).json({ message: "Only admin can delete this resource" });
    }
  }
);

//login admin seller
router.post(
  "/admin/login",

  [
    check("email", "Please enter a proper email").isEmail(),
    check(
      "password",
      "Please enter a password with more than 6 characters"
    ).isLength({ min: 6 }),
  ],

  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const email = req.body.email;
    const password = req.body.password;

    Seller.findOne({ email: email })
      .then(function (myData) {
        if (myData === null) {
          return res
            .status(403)
            .json({ message: `user not found with email ${email}` });
        } else if (!myData.admin) {
          return res
            .status(402)
            .json({ message: "Please login with admin account .." });
        }

        bcrypt.compare(password, myData.password, function (err, result) {
          if (result === false) {
            return res.status(404).json({ message: "password is invalid!!" });
          }
          //username and password valid

          const token = jwt.sign({ sellerID: myData._id }, "secretkey");
          res.status(200).json({
            message: "login success",
            token: token,
          });
        });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  }
);

//get all seller users for admin
router.get(
  "/seller/admin/getallUsers",
  authorization.getSellerProfile,
  (req, res) => {
    if (req.user.admin) {
      Seller.find()
        .sort({ fullname: 1 })
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

//search

router.get(
  "/seller/search/:query",
  authorization.getSellerProfile,
  (req, res) => {
    if (req.user.admin) {
      var regex = new RegExp(req.params.query, "i");
      Seller.find({ fullname: regex })
        .sort({ fullname: 1 })
        .then((response) => {
          res.status(200).json(response);
        })
        .catch((err) => {
          res.status(400).json({ message: err.response });
          console.log(err.message);
        });
    } else {
      res.status(400).json({ message: "Only admin can access this resource" });
    }
  }
);

module.exports = router;
