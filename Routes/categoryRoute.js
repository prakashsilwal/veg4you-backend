const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Category = require("../models/Category");
const authorization = require("../middleware/authentication");

//@routes get category/all
//@desc Get All Category
//@access public
router.get("/category/all", async (req, res) => {
  try {
    let data = await Category.find({});
    res.status(200).json(data);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message,
    });
  }
});

//@routes POST category/insert
//@desc Add Category
//@access private seller
router.post(
  "/category/insert",
  authorization.verifySeller,
  [check("name", "Enter category name").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const { name } = req.body;

    const bodyCategory = {
      name: name.toLowerCase(),
    };
    try {
      let category = await Category.findOne({ name });
      if (category) {
        res.status(400).json({
          message: `Category ${name} already exist`,
        });
      } else {
        const newCategory = new Category(bodyCategory);
        category = await newCategory.save();
        res.status(200).json(category);
      }
    } catch (error) {
      console.log(error.message);
      res.status(400).send({ message: error.message });
    }
  }
);

//@routes Get /category/:categoryId
//@desc Get Single Category
//@access public

router.get("/category/:categoryId", async (req, res) => {
  const id = req.params.categoryId;
  try {
    const category = await Category.findById(id);
    if (category == null) {
      return res.status(400).json({
        message: "Caegory not found",
      });
    }
    res.status(200).json(category);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get(
  "/category/name/:catName",
  authorization.verifySeller,
  (req, res) => {
    Category.findOne({ name: req.params.catName })
      .then((cat) => {
        if (cat == null) {
          res.status(404).json({ message: "Category not found" });
          return;
        } else {
          res.status(200).json(cat);
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err });
      });
  }
);

//@routes DELETE /category/:categoryId
//@desc Delete Single Category
//@access private admin
router.delete(
  "/category/:categoryId",
  authorization.verifySeller,
  async (req, res) => {
    const id = req.params.categoryId;

    const category = Category.findById(id);

    try {
      await category.deleteOne();
      res.status(200).json({
        message: `deleted successfully`,
      });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

//@routes PUT api/category/:categoryId
//@desc Update Single Category
//@access private admin
router.put(
  "/category/:categoryId",
  authorization.verifySeller,
  async (req, res) => {
    const id = req.params.categoryId;
    //getting name from body
    const { name } = req.body;
    //removing whitespace
    let updateFields = null;
    if (name)
      updateFields = {
        name: req.body.name.trim().toLowerCase(),
      };

    try {
      //updating a category
      await Category.findByIdAndUpdate(id, updateFields);
      res.status(200).json({ message: "Category updated successfully... " });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;
