var config = require('./lib/config/config');
var colors = require('colors');
var path = require('path');
var fs = require('fs');
fs.mkdir(path.join(config.root, 'uploads'), function (err) {
  if(err) {
    throw err;
  }
  console.log('Upload directory created!'.green);
});