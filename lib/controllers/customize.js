var mime = require('mime');
var fs = require('fs');
var url = require('url');
var path = require('path');
var validator = require('validator');
var request = require('request');

var settings = require('./settings');
var config = require('../config/config');
var nano = require('nano')(settings.couchdb.url);

var sites = nano.use(settings.couchdb.sites);

/**
 * Removes the temporary uploaded file from the server
 * @param  {String}   imagePath The path of the image
 * @param  {Function} callback The callback function to send back
 * @return {Function} callback ^
 */
function removeFile(imagePath, callback) {
  fs.unlink(imagePath, function(err) {
    if(err) {
      console.log('File Unlink');
      console.log(err);
      return callback();
    }
    return callback();
  });
}

/**
 * Downloads image based on the URL provided and stores to server and then to DB
 * @param  {String} siteid   The Site ID
 * @param  {String} imageURL The url of the image
 * @param  {String} uploadDir The directory on the server to upload the files
 * @param  {String} imageType Whether the image is a favicon or a logo
 * @return {Object} res The response to the client
 */
function _uploadURLImage(siteid, imageURL, uploadDir, relativeDir, imageType, res) {
  // Get the name of the image including the extension
  var filenameArr = url.parse(imageURL).pathname.split('/');
  var filename = filenameArr[filenameArr.length - 1];
  // Create file and relative paths based on tyep of image
  var filePath = null;
  var relativePath = null;
  if(imageType === 'favicon') {
    filePath = path.resolve(config.root + '/' + uploadDir + '/favicon/' + filename);
    relativePath = path.resolve(relativeDir + '/favicon/' + filename);
  } else if(imageType === 'logo') {
    filePath = path.resolve(config.root + '/' + uploadDir + '/logo/' + filename);
    relativePath = path.resolve(relativeDir + '/logo/' + filename);
  } else {
    filePath = path.resolve(config.root + '/' + uploadDir + '/cover/' + filename);
    relativePath = path.resolve(relativeDir + '/cover/' + filename);
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
      //Max 30KB, min 1 KB
      if(imageSize > 30720 || imageSize < 1024) {
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
      sites.get(siteid, function (error, reply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem registered image.'});
      }
        if(imageType === 'favicon') {
          reply.customize.favicon = relativePath;
        } else if(imageType === 'logo') {
          reply.customize.logo = relativePath;
        } else {
          reply.customize.cover = relativePath;
        }
        // Store new data in DB
        sites.insert(reply, siteid, function (error) {
          if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem registered image.'});
          }
          // TODO We might want to improve this some how. For now, we want the path only for unlinking the file when we are doing testing
          if(config.env !== 'production') {
            return res.json({message: 'Image registered.', path: filePath});
          } else {
            return res.json({message: 'Image registered.'});
          }
        });
      });
    }
  });
}

/**
 * Extracts file uploaded from client and stores in new location along with it's path in the DB
 * @param  {String} siteid    The Site ID
 * @param  {File}   image     The image object
 * @param  {String} uploadDir The directory to upload files to
 * @param  {String} imageType Whether the image is a logo or favicon
 * @param  {Object} res       The response object from the server
 * @return {Object} res       ^
 */
function _uploadFileImage(siteid, image, uploadDir, relativeDir, imageType, res) {
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
    //Max 30KB, min 1 KB
    if(imageSize > 30720 || imageSize < 1024) {
      fileValid = false;
      removeFile(imagePath, function (err) {
        return res.json(400, {message: 'Filesize invalid. Must be between 1 KB and 4 KB.'});
      });
    }
    targetPath = path.resolve(uploadDir + '/favicon/' + imageName);
    relativePath = path.resolve(relativeDir + '/favicon/' + imageName);
  } else if(imageType === 'logo') {
    //Max 5 MB, min 1 KB
    if(imageSize > 5242880 || imageSize < 1024) {
      fileValid = false;
      removeFile(imagePath, function (err) {
        return res.json(400, {message: 'Filesize invalid. Must be between 1 KB and 5 MB.'});
      });
    }
    targetPath = path.resolve(uploadDir + '/logo/' + imageName);
    relativePath = path.resolve(relativeDir + '/logo/' + imageName);
  } else {
    //Max 5 MB, min 1 KB
    if(imageSize > 5242880 || imageSize < 1024) {
      fileValid = false;
      removeFile(imagePath, function (err) {
        return res.json(400, {message: 'Filesize invalid. Must be between 1 KB and 5 MB.'});
      });
    }
    targetPath = path.resolve(uploadDir + '/cover/' + imageName);
    relativePath = path.resolve(relativeDir + '/cover/' + imageName);
  }
  if(fileValid) {
    // Move from temp path to new path
    fs.rename(imagePath, targetPath, function(err) {
      if(err) {
        console.log('File Rename');
        console.log(err);
        return res.json(500, {message: 'Problem registered image.'});
      }
      // Query DB
      sites.get(siteid, function (error, reply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem registered image.'});
        }
        if(imageType === 'favicon') {
          reply.customize.favicon = relativePath;
        } else if(imageType === 'logo') {
          reply.customize.logo = relativePath;
        } else {
          reply.customize.cover = relativePath;
        }
        // Store new data in DB
        sites.insert(reply, siteid, function (error) {
          if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem registered image.'});
          }
          // TODO We might want to improve this some how. For now, we want the path only for unlinking the file when we are doing testing
          if(config.env !== 'production') {
            return res.json({message: 'Image registered.', path: targetPath});
          } else {
            return res.json({message: 'Image registered.'});
          }
        });
      });
    });
  }
}

exports.uploadLogo = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  var image = req.files.file;
  var imageURL = req.body.url;
  // If the image is a string and its not a url
  if(!validator.isNull(imageURL) && !validator.isURL(imageURL)) {
    return res.json(400, {message: 'Invalid URL.'});
  }
  if(validator.isURL(imageURL)) {
    return _uploadURLImage(siteid, imageURL, req.uploadDir, req.uploadRelative, 'logo', res);
  } else {
    return _uploadFileImage(siteid, image, req.uploadDir, req.uploadRelative, 'logo', res);
  }
};

exports.retrieveUpload = function(req, res) {
  // TODO add session checking if wanted
  var filename = req.params.fileName;
  // uploads/logo/<logo> || uploads/favicon/<favicon>/<image name>.<ext>
  var filePath = path.resolve(config.root + '/' + req.url.substring(1));
  var fileType = mime.lookup(filePath);
  fs.readFile(filePath, function (error, file) {
    if(error) {
      console.log('File Read File');
      console.log(error);
      return res.json(500, {message: 'Could not read file.'});
    }
    res.writeHead(200, {'Content-Type': fileType});
    res.write(file, 'binary');
    res.end();
  });
};

exports.getCustomData = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting user data.'});
    }
    return res.json(reply.customize);
  });
};

exports.setCustomData = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var bodyBackground = req.body.bodyBackground;
  var fontColor = req.body.fontColor;
  var lightFontColor = req.body.lightFontColor;
  var greenColor = req.body.greenColor;
  var yellowColor = req.body.yellowColor;
  var orangeColor = req.body.orangeColor;
  var redColor = req.body.redColor;
  var linkColor = req.body.linkColor;
  var borderColor = req.body.borderColor;
  var graphColor = req.body.graphColor;
  var headline = req.body.headline;
  var aboutPage = req.body.aboutPage;
  var layoutType = req.body.layoutType;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isHexColor(bodyBackground) ||
    !validator.isHexColor(fontColor) ||
    !validator.isHexColor(lightFontColor) ||
    !validator.isHexColor(greenColor) ||
    !validator.isHexColor(yellowColor) ||
    !validator.isHexColor(orangeColor) ||
    !validator.isHexColor(redColor) ||
    !validator.isHexColor(linkColor) ||
    !validator.isHexColor(borderColor) ||
    !validator.isHexColor(graphColor)) {
    return res.json(400, {message: 'Invalid hex color for an input.'});
  }
  if(!validator.isLayoutType(layoutType)) {
    return res.json(400, {message: 'Invalid layout type.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting user data.'});
    }
    reply.customize.bodyBackground = bodyBackground;
    reply.customize.fontColor = fontColor;
    reply.customize.lightFontColor = lightFontColor;
    reply.customize.greenColor = greenColor;
    reply.customize.yellowColor = yellowColor;
    reply.customize.orangeColor = orangeColor;
    reply.customize.redColor = redColor;
    reply.customize.linkColor = linkColor;
    reply.customize.borderColor = borderColor;
    reply.customize.graphColor = graphColor;
    reply.customize.headline = headline;
    reply.customize.aboutPage = aboutPage;
    reply.customize.layoutType = layoutType;
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating settings.'});
      }
      return res.json({message: 'Settings updated.'});
    });
  });
};

exports.uploadFavicon = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var favicon = req.files.file;
  var favURL = req.body.url;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  // If the favURL is a string and its not a url
  if(!validator.isNull(favURL) && !validator.isURL(favURL)) {
    return res.json(400, {message: 'Invalid URL.'});
  }
  if(validator.isURL(favURL)) {
    return _uploadURLImage(siteid, favURL, req.uploadDir, req.uploadRelative, 'favicon', res);
  } else {
    return _uploadFileImage(siteid, favicon, req.uploadDir, req.uploadRelative, 'favicon', res);
  }
};

exports.uploadCover = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var cover = req.files.file;
  var coverURL = req.body.url;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  // If the coverURL is a string and its not a url
  if(!validator.isNull(coverURL) && !validator.isURL(coverURL)) {
    return res.json(400, {message: 'Invalid URL.'});
  }
  if(validator.isURL(coverURL)) {
    return _uploadURLImage(siteid, coverURL, req.uploadDir, req.uploadRelative, 'cover', res);
  } else {
    return _uploadFileImage(siteid, cover, req.uploadDir, req.uploadRelative, 'cover', res);
  }
};

exports.getDomain = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting domain.'});
    }
    return res.json({domain: reply.domain});
  });
};

exports.updateDomain = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var domain = req.body.domain;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isURL(domain)) {
    return res.json(400, {message: 'Invalid domain.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating domain.'});
    }
    reply.domain = domain;
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating domain.'});
      }
      return res.json({message: 'Domain Updated.'});
    });
  });
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

validator.extend('isLayoutType', function (str) {
  switch(str) {
    case 'cover':
    case 'basic':
    return true;
    default:
    return false;
  }
});