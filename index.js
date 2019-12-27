//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const app = express();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var globalUser;
// Use Session module
session = require('express-session');
app.use(session({
  secret: '2C44-4D44-WppQ38S',
  resave: true,
  saveUninitialized: true
}));


//Create connection of mysql
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crud_db'
});

//connect to mysql database
conn.connect((err) => {
  if (err) throw err;
  console.log('Mysql Connected...');
});

//set views file
app.set('views', path.join(__dirname, 'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set public folder as static folder for static file
app.use('/assets', express.static(__dirname + '/public'));
var auth = function (req, res, next) {
  if (req.session && req.session.user == globalUser && req.session.admin)
    return next();
  else
    return res.render('login', {message: "You must login first"});
};
app.get('/logout', function (req, res) {
  req.session.destroy();
  globalUser=null;
  res.render('login', {message: "You have logout successfully"});
});


//route for homepage
app.get('/content', auth, (req, res) => {
  let sql = "SELECT * FROM product";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.render('product_view', {
      results: results
    });
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static('./'));
app.get('/', (req, res) => {
  res.render("login");

});

app.get('/signup', (req, res) => {
  res.render("signup");

});

app.post('/login_submit', function (req, response) {
  var username = req.body.username;
  var pass = req.body.pass;
  //checkUser(username,pass,res)

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    // console.log(typeof myobj)
    console.log("MongoDB created!");
    var dbo = db.db("mydb");

    myobj = { user: username, password: pass }

    // myobj={user: "'"+username+"'", password: "'"+pass+"'"}
    console.log(myobj)
    dbo.collection("users").findOne(myobj, function (err, res) {
      if (err) throw err
      console.log(res)
      if (!res) {
        // response.redirect("/");
        response.render('login', {
          message: "Username or password is incorrect"
        });
        console.log("Username or password is incorrect");

      }
      else {
        req.session.user = username;
        req.session.admin = true;
        // res.send("login success!");
        globalUser=username;
        response.redirect("/content");


      }

    });
    db.close();
  });
})
app.post('/signup_submit', function (req, res) {
  var username = req.body.username;
  var pass = req.body.pass;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("MongoDB accessed!");
    var dbo = db.db("mydb");

    myobj = { user: username, password: pass }

    // myobj={user: "'"+username+"'", password: "'"+pass+"'"}
    console.log(myobj)
    dbo.collection("users").insertOne(myobj, function (err, res) {
      if (err) throw err

      console.log(res)

    });
    db.close();
  });

  res.redirect('/');
})

//route for insert data
app.post('/save', (req, res) => {
  let data = { product_name: req.body.product_name, product_price: req.body.product_price, product_desc: req.body.product_desc, product_img:req.body.product_img, product_category: req.body.product_category, product_reviews: req.body.product_reviews };
  let sql = "INSERT INTO product SET ?";
  let query = conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect('/content');
  });
});

//route for update data
app.post('/update', (req, res) => {
  let sql = "UPDATE product SET product_name='" + req.body.product_name + "', product_price='" + req.body.product_price + "' WHERE product_id=" + req.body.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/content');
  });
});

//route for delete data
app.post('/delete', (req, res) => {
  let sql = "DELETE FROM product WHERE product_id=" + req.body.product_id + "";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/content');
  });
});

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});