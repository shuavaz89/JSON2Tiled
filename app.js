var express = require('express')
var path = require('path');
var multer = require('multer')
var upload = multer()
var app = express()
var json2tiled = require('./lib/json2tiled');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.post('/upload', upload.array('upload_file'), function (req, res, next) {

    if (req.files.length === 0) {
        return res.end('<p>Missing file  <a href="/">Back</a></p>');
    }

    for (var i = 0, len = req.files.length; i < len; i++) {
        var file = req.files[i];
        var fileInfo = path.parse(file.originalname);

        if (fileInfo.ext !== '.json') {
            return res.end('<p>File format must be JSON <a href="/">Back</a></p>');
        }

        //Setup XML
        var xml = json2tiled(JSON.parse(file.buffer))

        res.set('Content-disposition', 'attachment; filename=' + fileInfo.name + '.tmx');
        res.set('Content-Type', 'application/xml');
        res.send(xml);
    }
})

app.listen(3000, function () {
    console.log('JSON2Tiled listening on port 3000!')
})