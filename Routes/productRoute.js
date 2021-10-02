const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { check, validationResult } = require("express-validator");
const authorization = require("../middleware/authentication");

//add product
router.post(
  "/product/insert",
  authorization.verifySeller,

  [
    check("ProductName", "Enter the product name").not().isEmpty(),
    check("ProductLocation", "Enter the product location").not().isEmpty(),
    check("ProductCategory", "Choose the product category").not().isEmpty(),
    check("ProductDescription", "Enter the product description")
      .not()
      .isEmpty(),
    check("ProductPrice", "Enter the product price in numbers").isNumeric(),
    check("ProductQuantity", "Enter the product quantity").isNumeric(),

    check(
      "ProductAddedBy",
      "Cannot add the product becuase we donot know who is adding the product"
    )
      .not()
      .isEmpty(),
  ],

  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array()[0].msg);
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const ProductName = req.body.ProductName;
    const ProductLocation = req.body.ProductLocation;
    const ProductImage = req.body.ProductImage;
    const ProductDescription = req.body.ProductDescription;
    const ProductPrice = req.body.ProductPrice;
    const ProductQuantity = req.body.ProductQuantity;
    const ProductCategory = req.body.ProductCategory;
    const ProductAddedBy = req.body.ProductAddedBy;

    const ProductData = new Product({
      ProductName: ProductName,
      ProductLocation: ProductLocation.toLowerCase(),
      ProductImage: ProductImage,
      ProductDescription: ProductDescription,
      ProductPrice: ProductPrice,
      ProductQuantity: ProductQuantity,
      ProductCategory: ProductCategory,
      ProductAddedBy: ProductAddedBy,
    });
    ProductData.save()
      .then(function (result) {
        res.status(201).json({ message: "Product Added!!" });
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).json({ message: "Product unable to add!!" });
      });
  }
);

//All Product show
router.get("/product/showall", function (req, res) {
  Product.find()
    .sort({ createdAt: -1 })
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (error) {
      res.status(400).json({ message: error.message });
    });
});

//get product by categories
router.get("/product/category/:id", (req, res) => {
  Product.find({ ProductCategory: req.params.id })
    .sort({ createdAt: -1 })
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((err) => {
      res.json(400).json({ message: err.message });
    });
});

//All products of a seller
router.get(
  "/product/seller/showall",
  authorization.verifySeller,
  authorization.getSellerProfile,
  (req, res) => {
    const sid = req.user._id;

    Product.find({ ProductAddedBy: sid })
      .sort({ createdAt: -1 })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  }
);

//get single product
router.get("/product/single/:pid", function (req, res) {
  const pid = req.params.pid;
  Product.findById(pid)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (error) {
      res.status(400).json({ message: error });
    });
});

//delete product
router.delete(
  "/product/delete/:pid",
  authorization.verifySeller,
  function (req, res) {
    const pid = req.params.pid;
    Product.deleteOne({ _id: pid })
      .then(function (result) {
        res.status(200).json("Product deleted!!");
      })
      .catch(function (error) {
        res.status(400).json({ message: "Product unable to delete!!" });
      });
  }
);

//update product image
router.put(
  "/product/update/image/:pid",
  authorization.verifySeller,
  (req, res) => {
    const id = req.params.pid;
    const ProductImage = req.body.ProductImage;
    Product.updateOne(
      { _id: id },
      {
        ProductImage: ProductImage,
      }
    )
      .then((result) => {
        res.status(200).json("Product Image updated Successfully");
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
  }
);

//Update product
router.put(
  "/product/update/:pid",
  authorization.verifySeller,
  [
    check("ProductName", "Enter the product name").not().isEmpty(),
    check("ProductLocation", "Enter the product location").not().isEmpty(),
    check("ProductCategory", "Choose the product category").not().isEmpty(),
    check("ProductDescription", "Enter the product description")
      .not()
      .isEmpty(),
    check("ProductPrice", "Enter the product price in numbers").isNumeric(),
    check("ProductQuantity", "Enter the product quantity").isNumeric(),
  ],

  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const ProductName = req.body.ProductName;
    const ProductLocation = req.body.ProductLocation;
    const ProductCategory = req.body.ProductCategory;
    const ProductDescription = req.body.ProductDescription;
    const ProductPrice = req.body.ProductPrice;
    const ProductQuantity = req.body.ProductQuantity;
    const id = req.params.pid;

    Product.updateOne(
      { _id: id },
      {
        ProductName: ProductName,
        ProductLocation: ProductLocation,
        ProductDescription: ProductDescription,
        ProductCategory: ProductCategory,
        ProductPrice: ProductPrice,
        ProductQuantity: ProductQuantity,
      }
    )

      .then(function (result) {
        res.status(201).json("Product Updated!!");
      })
      .catch(function (error) {
        res.status(400).json({ message: "Product unable to update!!" });
      });
  }
);

//sell product
router.put("/product/sell/:id", (req, res) => {
  Product.updateOne(
    { _id: req.params.id },
    {
      ProductSold: req.body.ProductSold,
    }
  )
    .then((response) => {
      // console.log(response);
      res.status(200).json("Product Sold");
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
    });
});

//like
router.put("/product/like", authorization.verifyBuyer, (req, res) => {
  Product.findByIdAndUpdate(
    req.body.productId,
    { $push: { likes: req.body.userId } },
    { new: true }
  )
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
    });
});

//unlike
router.put("/product/unlike", authorization.verifyBuyer, (req, res) => {
  Product.findByIdAndUpdate(
    req.body.productId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  )
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
    });
});

//comment
router.put("/product/comment", authorization.verifyBuyer, (req, res, next) => {
  let comment = { text: req.body.text, postedBy: req.body.userId };
  Product.findByIdAndUpdate(
    req.body.productId,
    { $push: { comments: comment } },
    { new: true }
  )
    .then((comment) => {
      res.status(201).json(comment);
    })
    .catch((err) => {
      res.status(400).json({ message: err });
    });
});

//uncomment
router.put("/product/uncomment", authorization.verifyBuyer, (req, res) => {
  Product.findByIdAndUpdate(
    req.body.productId,
    { $pull: { comments: { _id: req.body.commentId } } },
    { new: true }
  )
    .then((comment) => {
      res.status(200);
      res.json(comment);
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
    });
});

//search
router.get("/product/search/:query", (req, res) => {
  var regex = new RegExp(req.params.query, "i");
  Product.find({ ProductName: regex })
    .sort({ createdAt: -1 })
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(400).json({ message: err.response });
      console.log(err.message);
    });
});

module.exports = router;
