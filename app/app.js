var express  = require("express"),
    app      = express(),
    bodyParser  = require("body-parser"),
    mongoose = require('mongoose'),
    routingLyra = require('./routing/uploadImageRouting');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
app.post('/upload', multipartMiddleware, function(req, res) {
  console.log(req.files)
  console.log(req.body)
  // don't forget to delete all req.files when done
});
*/

app.use('/api', routingLyra);


mongoose.Promise = global.Promise;
// Connection to DB
mongoose.connect('mongodb://localhost/imagenes_lyra',{useMongoClient: true},
 function(err, res) {
  if(err) throw err;
    console.log('Connected to Database');
});

// Start server
app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});
