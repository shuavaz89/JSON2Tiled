module.exports = json2tiled;

function json2tiled (buffer) {
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

    return sendXML;
}