var mime = require('mime');
var fs = require('fs');
var url = require('url');
var path = require('path');
var redis = require('redis');
var validator = require('validator');
var request = require('request');

var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);

/**
 * Removes the temporary uploaded file from the server
 * @param  {String}   imagePath The path of the image
 * @param  {Function} callback The callback function to send back
 * @return {Function} callback ^
 */
function removeFile(imagePath, callback) {
  fs.unlink(imagePath, function(err) {
    if(err) {
      console.log(err);
      return callback();
    }
    return callback();
  });
}

/**
 * Downloads image based on the URL provided and stores to server and then to DB
 * @param  {String} email    Email of the user
 * @param  {String} imageURL The url of the image
 * @param  {String} uploadDir The directory on the server to upload the files
 * @param  {String} imageType Whether the image is a favicon or a logo
 * @return {Object} res The response to the client
 */
function _uploadURLImage(email, imageURL, uploadDir, imageType, res) {
  // Get the name of the image including the extension
  var filenameArr = url.parse(imageURL).pathname.split('/');
  var filename = filenameArr[filenameArr.length - 1];
  // Create file and relative paths based on tyep of image
  var filePath = null;
  var relativePath = null;
  if(imageType === 'favicon') {
    filePath = path.resolve(__dirname + '../../../' + uploadDir + '/favicon/' + filename);
    relativePath = uploadDir + '/favicon/' + filename;
  } else {
    filePath = path.resolve(__dirname + '../../../' + uploadDir + '/logo/' + filename);
    relativePath = uploadDir + '/logo/' + filename;
  }
  // Download the image
  var imageReq = request(imageURL);
  // Pipe the image to the chosen path
  imageReq.pipe(fs.createWriteStream(filePath));
  imageReq.on('response', function(resp) {
    // TODO possibly check for 304 (Not Modified) as well
    if(resp.statusCode !== 200) {
      return res.json(400, {message: 'Image could not be downloaded.'});
    }
    // If file is not an image, failed.
    if(!validator.isImage(filePath)) {
      removeFile(filePath, function (err) {
        return res.json(400, {message: 'Only PNG, GIF, JPG/JPEG, and ICOs are allowed.'});
      });
    }
    // Get image size
    var imageSize = fs.statSync(filePath).size;
    var fileValid = true;
    if(imageType === 'favicon') {
      //Max 4KB, min 1 KB
      if(imageSize > 4096 || imageSize < 1024) {
        fileValid = false;
        removeFile(filePath, function (err) {
          return res.json(400, {message: 'Filesize invalid. Must be between 1 KB and 4 KB.'});
        });
      }
    } else {
      //Max 5 MB, min 1 KB
      if(imageSize > 5242880 || imageSize < 1024) {
        fileValid = false;
        removeFile(filePath, function (err) {
          return res.json(400, {message: 'Filesize invalid. Must be between 1 KB and 5 MB.'});
        });
      }
    }
    if(fileValid) {
      // Query DB
      client.get(email, function (error, reply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem registered image.'});
        }
        try {
          reply = JSON.parse(reply);
          if(imageType === 'favicon') {
            reply.customize.favicon = relativePath;
          } else {
            reply.customize.logo = relativePath;
          }
          // Store new data in DB
          client.set(email, JSON.stringify(reply), function (error) {
            if(error) {
              console.log(error);
              return res.json(500, {message: 'Problem registered image.'});
            }
            return res.json({message: 'Image registered.'});
          });
        } catch(e) {
          return res.json(400, {message: 'Invalid email.'});
        }
      });
    }
  });
}

/**
 * Extracts file uploaded from client and stores in new location along with it's path in the DB
 * @param  {String} email     The database key to query with
 * @param  {File}   image     The image object
 * @param  {String} uploadDir The directory to upload files to
 * @param  {String} imageType Whether the image is a logo or favicon
 * @param  {Object} res       The response object from the server
 * @return {Object} res       ^
 */
function _uploadFileImage(email, image, uploadDir, imageType, res) {
  // Check to see if image is an image based on MIME-type
  var imagePath = image.path;
  var imageNameArr = image.path.split('/');
  var imageName = imageNameArr[imageNameArr.length - 1];
  if(!validator.isImage(imagePath)) {
    removeFile(imagePath, function (err) {
      return res.json(400, {message: 'Only PNG, GIF, JPG/JPEG, and ICOs are allowed.'});
    });
  }
  var imageSize = image.size;
  var targetPath = null;
  var relativePath = null;
  var fileValid = true;
  // Check file size
  if(imageType === 'favicon') {
    //Max 4KB, min 1 KB
    if(imageSize > 4096 || imageSize < 1024) {
      fileValid = false;
      removeFile(imagePath, function (err) {
        return res.json(400, {message: 'Filesize invalid. Must be between 1 KB and 4 KB.'});
      });
    }
    targetPath = path.resolve(__dirname + '../../../' + uploadDir + '/favicon/' + imageName);
    relativePath = uploadDir + '/favicon/' + imageName;
  } else {
    //Max 5 MB, min 1 KB
    if(imageSize > 5242880 || imageSize < 1024) {
      fileValid = false;
      removeFile(imagePath, function (err) {
        return res.json(400, {message: 'Filesize invalid. Must be between 1 KB and 5 MB.'});
      });
    }
    targetPath = path.resolve(__dirname + '../../../' + uploadDir + '/logo/' + imageName);
    relativePath = uploadDir + '/logo/' + imageName;
  }
  if(fileValid) {
    // Move from temp path to new path
    fs.rename(imagePath, targetPath, function(err) {
      if(err) {
        console.log(err);
        return res.json(500, {message: 'Problem registered image.'});
      }
      // Query DB
      client.get(email, function (error, reply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem registered image.'});
        }
        try {
          reply = JSON.parse(reply);
          if(imageType === 'favicon') {
            reply.customize.favicon = relativePath;
          } else {
            reply.customize.logo = relativePath;
          }
          // Store new data in DB
          client.set(email, JSON.stringify(reply), function (error) {
            if(error) {
              console.log(error);
              return res.json(500, {message: 'Problem registered image.'});
            }
            return res.json({message: 'Image registered.'});
          });
        } catch(e) {
          console.log(e.message);
          return res.json(400, {message: 'Invalid email.'});
        }
      });
    });
  }
}

exports.uploadLogo = function(req, res) {
  if(!req.session.email) {
      return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var image = req.files.file;
  var imageURL = req.body.url;
  // If the image is a string and its not a url
  if(!validator.isNull(imageURL) && !validator.isURL(imageURL)) {
    return res.json(400, {message: 'Invalid URL.'});
  }
  if(validator.isURL(imageURL)) {
    return _uploadURLImage(email, imageURL, req.uploadDir, 'logo', res);
  } else {
    return _uploadFileImage(email, image, req.uploadDir, 'logo', res);
  }
};

exports.retrieveUpload = function(req, res) {
  // TODO add session checking if wanted
  var filename = req.params.fileName;
  // uploads/<logo || favicon>/<image name>.<ext>
  var filePath = req.url.substring(1);
  var fileType = mime.lookup(filePath);
  fs.readFile(filePath, function (error, file) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Could not read file.'});
    }
    res.writeHead(200, {'Content-Type': fileType});
    res.write(file, 'binary');
    res.end();
  });
};

exports.getCustomData = function(req, res) {
  if(!req.session.email) {
      return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  client.get(email, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting user data.'});
    }
    try {
      reply = JSON.parse(reply);
      return res.json(reply.customize);
    } catch(e) {
      return res.json(400, {message: 'Invalid email.'});
    }
  });
};

exports.uploadFavicon = function(req, res) {
  if(!req.session.email) {
      return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var favicon = req.files.file;
  var favURL = req.body.url;
  // If the favURL is a string and its not a url
  if(!validator.isNull(favURL) && !validator.isURL(favURL)) {
    return res.json(400, {message: 'Invalid URL.'});
  }
  if(validator.isURL(favURL)) {
    return _uploadURLImage(email, favURL, req.uploadDir, 'favicon', res);
  } else {
    return _uploadFileImage(email, favicon, req.uploadDir, 'favicon', res);
  }
};

/**
 * Check local file to see if it's an image file or not.
 * @param  {String} imagePath The relative path to the image
 * @return {Boolean} Whether the file is an image or not
 */
validator.extend('isImage', function (imagePath) {
  var imageType = mime.lookup(imagePath);
  switch(imageType) {
    case 'image/jpeg':
    case 'image/gif':
    case 'image/png':
    case 'image/x-icon':
    return true;
    default:
    return false;
  }
});