var express = require('express')
var path = require('path');
var multer = require('multer')
var builder = require('xmlbuilder');
var upload = multer()
var app = express()

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

    //Setup Object
    var buffer = JSON.parse(req.file.buffer);

    var xmlObj = {
        map: {}
    };

    //Map Properties
    for (var prop in buffer) {
        if (typeof buffer[prop] != 'object') {
            xmlObj.map['@' + prop] = buffer[prop];
        }
    }

    //Create XML
    var xml = builder.create(xmlObj, {
        version: "1.0",
        encoding: "UTF-8"
    });

    //Tileset
    for (var i = 0, len = buffer.tilesets.length; i < len; i++) {
        var tileset = xml.ele('tileset')
        var tilesetImage = tileset.ele('image');
        for (var prop in buffer.tilesets[i]) {
            var value = buffer.tilesets[i][prop];
            if (typeof value != 'object') {
                switch (prop) {
                    case 'image':
                        tilesetImage.att('source', value)
                        break;
                    case 'imageheight':
                        tilesetImage.att('height', value)
                        break;
                    case 'imagewidth':
                        tilesetImage.att('width', value)
                        break;
                    default:
                        //Add tilset attributes
                        tileset.att(prop, value)
                        break;
                }
            } else {
                //Add sublevel
                //There is a properties object, need to figure this part out
            }
        }
    }

    //Layer & Objects
    for (var i = 0, len = buffer.layers.length; i < len; i++) {

        //Layer props
        if (buffer.layers[i].data) {
            var layer = xml.ele('layer')
            for (var prop in buffer.layers[i]) {
                var value = buffer.layers[i][prop];
                if (typeof value != 'object') {
                    switch (prop) {
                        case 'name':
                            layer.att(prop, value)
                            break;
                        case 'width':
                            layer.att(prop, value)
                            break;
                        case 'height':
                            layer.att(prop, value)
                            break;
                        default:
                            //There are addiontal props for layer, need to figure this part out
                            break;
                    }
                } else {

                }
            }
            //Layer Data
            layer.ele('data', {
                'encoding': 'csv'
            }, buffer.layers[i].data);
        }

        //Objectgroup props
        if (buffer.layers[i].objects) {
            var objectgroup = xml.ele('objectgroup');
            for (var prop in buffer.layers[i]) {
                var value = buffer.layers[i][prop];
                if (typeof value != 'object') {
                    switch (prop) {
                        case 'name':
                            objectgroup.att(prop, value)
                            break;
                        default:
                            //There are addiontal props for objectgroup, need to figure this part out
                            break;
                    }
                }
            }
            //Objects props
            for (var j = 0, len2 = buffer.layers[i].objects.length; j < len2; j++) {
                var value2 = buffer.layers[i].objects[j];
                var object = objectgroup.ele('object', {
                    id: value2.id,
                    name: value2.name,
                    x: value2.x,
                    y: value2.y,
                    width: value2.width,
                    height: value2.height //There are addiontal props for object, need to figure this part out
                });

                //If has properties
                if (!isEmpty(value2.properties)) {
                    var properties = object.ele('properties');
                    for (var prop2 in value2.properties) {
                        properties.ele('property', {
                            "name": prop2,
                            "value": value2.properties[prop2]
                        })
                    }
                }
            }
        }

    }

    var sendXML = xml.end({
        pretty: true
    });

    res.set('Content-disposition', 'attachment; filename=Tiled.tmx');
    res.set('Content-Type', 'application/xml');
    res.send(sendXML);

})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})