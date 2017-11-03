/**
 * JSON2Tiled 
 * Convert Tiled JSON Map Format to Tiled TMX Map Format.
 *
 * 
 */

var express = require('express')
var path = require('path');
var multer = require('multer')
var builder = require('xmlbuilder');
var upload = multer()
var app = express()
var json2tiled = require('json2tiled');

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.post('/upload', upload.single('upload_file'), function (req, res, next) {

    if (!req.file) {
        return res.end('<p>Missing file  <a href="/">Back</a></p>');
    }

    var fileInfo = path.parse(req.file.originalname);

    if (fileInfo.ext !== '.json') {
        return res.end('<p>File format must be JSON <a href="/">Back</a></p>');
    }

    //Setup XML
    var xml = json2tiled(JSON.parse(req.file.buffer))

    res.set('Content-disposition', 'attachment; filename=Tiled.tmx');
    res.set('Content-Type', 'application/xml');
    res.send(xml);

})

app.listen(3000, function () {
    console.log('JSON2Tiled listening on port 3000!')
})