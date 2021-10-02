process.env.NODE_ENV = "test";

var chai = require("chai");
var chaiHttp = require("chai-http");
var app = require("../app");
const should = chai.should();
chai.use(chaiHttp);


//this should 
const sellerToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxsZXJJRCI6IjYwNjgzZDRkMTExN2NmMzE3Y2M5NDI5NiIsImlhdCI6MTYxODg2NjAzNH0.wsxu7I917YKvwz25bHgkqy07trdIkRAsL_veaDvLXPE";
const adminToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxsZXJJRCI6IjYwNjgzZDIwMTExN2NmMzE3Y2M5NDI5NSIsImlhdCI6MTYxODg2NjEwMn0.rysi6z8hKQdEp7o7O__OfpqRlO_HdY9LqxT5FfQ1Xb8";

//get all products
describe("/GET Products", () => {
  it("it should Get all the products", (done) => {
    chai
      .request(app)
      .get("/product/showall")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//get all products by
describe("/GET Products", () => {
  it("it should Get all the products of the given category", (done) => {
    chai
      .request(app)
      .get("/product/category/606832cf5467dd3034f46961")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//get a single products by id
describe("/GET a Product", () => {
  it("it should Get a products of the given id", (done) => {
    const pid = "60688354eb4b642b9427b56c";
    chai
      .request(app)
      .get(`/product/single/${pid}`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//delete a product by id
describe("/DELETE a Product", () => {
  it("it should delete a products of the given id", (done) => {
    const pid = "60688354eb4b642b9427b56c";
    chai
      .request(app)
      .delete(`/product/delete/${pid}`)
      .set("Authorization", "Bearer " + sellerToken) //set the header first
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//login seller
describe("/POST login a user", () => {
  it("it should login a seller user", (done) => {
    const user = {
      email: "sirishk90@gmail.com",
      password: "sirish",
    };
    chai
      .request(app)
      .post(`/seller/login`)
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//register seller
describe("/POST register a user", () => {
  it("it should register a seller user", (done) => {
    const user = {
      fullname: "test",
      email: "test@gmail.com",
      password: "test12",
      phoneNumber: 1245789542,
      address: "kathmandu, Nepal",
    };
    chai
      .request(app)
      .post(`/seller/upload`)
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });
});

//get seller profile by token
describe("/GET a profile of seller", () => {
  it("it should get the profile of the seller if provide with token ", (done) => {
    chai
      .request(app)
      .get(`/seller/profileByToken`)
      .set("Authorization", "Bearer " + sellerToken) //set the header first
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//verify seller by admin
describe("/Put verify seller by admin", () => {
  it("it should verify the seller acount if provide with admin login token", (done) => {
    const userId = {
      sid: "60683d201117cf317cc94295",
    };
    chai
      .request(app)
      .put(`/seller/verify/admin`)
      .set("Authorization", "Bearer " + adminToken) //set the header first
      .send(userId)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//get a all the categories
describe("/GET all Categories", () => {
  it("it should Get all the categories", (done) => {
    chai
      .request(app)
      .get(`/category/all`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

//add a category
describe("/POST a category", () => {
  it("it should add a category", (done) => {
    const cat = {
      name: "men",
    };
    chai
      .request(app)
      .post(`/category/insert`)
      .set("Authorization", "Bearer " + sellerToken) //set the header first
      .send(cat)
      .end((err, res) => {
        res.should.have.status(400); // 200
        done();
      });
  });
});
