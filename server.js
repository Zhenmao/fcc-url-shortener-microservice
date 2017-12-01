// server.js
// where your node app starts

// init
// setup express for handling http requests
var express = require("express");
var app = express();
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
mongoose.connect(MONGODB_URI, {useMongoClient: true});

var BASE_URL = 'https://fcc-zhenmao-url-shortener-microservice.glitch.me/';

// Counter for auto increment short url number
var counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

var Counter = mongoose.model("Counter", counterSchema);

var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url_id: Number
});

// increment for short url
urlSchema.pre("save", function(next) {
  var doc = this;
  Counter.findByIdAndUpdate(
    "shortUrlId", 
    { $inc: {seq: 1} },
    { new: true, upsert: true }, function(err, count) {
      if (err) return next(err);
      console.log("...count: "+JSON.stringify(count));
      doc.short_url_id = count.seq;
      next();
    });
});

var Url = mongoose.model("Url", urlSchema);

app.use('/public', express.static(process.cwd() + '/public')); // http://expressjs.com/en/starter/static-files.html

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

// Homepage
app.get("/", function (request, response) {
  response.sendFile(process.cwd() + '/views/index.html');
});

// Create new shortened url
app.get("/new/:original_url(*)", function (request, response) {
  var original_url = request.params.original_url;
  
  // Check if url is valid
  var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  
  if (regex.test(original_url)) { // Url is valid
    Url.create({
      original_url: original_url
    }, function(err, url) {
      if (err) return handleError(err, response);
      var json = {
        original_url: url.original_url,
        short_url: BASE_URL + url.short_url_id.toString()
      }
      response.json(json);
    })
  } else { // Url is not valid
    response.json({error: "Invalid url"})
  }
});

// Redirect from shortened url
app.get("/:short_url_id", function (request, response) {
  var short_url_id = request.params.short_url_id;
  Url.findOne({ short_url_id: short_url_id }, function(err, doc) {
    if (err) return handleError(err, response);
    if (doc) {
      response.redirect(doc.original_url);
    } else {
      response.json({error: "Invalid url"});
    }
  })
});

function handleError(err, response) {
  response.status(500);
  response.send(
    "<html><head><title>Internal Server Error!</title></head><body><pre>"
    + JSON.stringify(err, null, 2) + "</pre></body></pre>"
  );
}

