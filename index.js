module.exports = filterObjectOnSchema;

function isObject(obj) {
    return obj === Object(obj);
}

function getType(schemaType) {
    if (!Array.isArray(schemaType)) {
        return schemaType;
    }

    // the type is an array of types instead
    // grab the first non-null type as validator (e.g. ['object', 'null'])
    var typeArray = schemaType;
    for (var i = 0; i < typeArray.length; i++) {
        var type = typeArray[i];
        if (type !== 'null') {
            return type;
        }
    }
}

function filterObjectOnSchema(schema, doc) {
    var result;  // returns the resulting filtered thing from this level; can be object, array, literal, ...

    // if the document is null/undefined, short-circuit and return it
    if (doc === null || doc === undefined) {
        return doc;
    }

    // otherwise, let's build the result based on casework
    var type = getType(schema.type);
    if (type === 'object' && isObject(doc) && schema.properties) {
        result = {};  // holds filtered set of object key/values from this level

        // process properties recursively
        Object.keys(schema.properties).forEach(function(key) {
            var child = doc[key];
            var sp = schema.properties[key];

            var filteredChild = filterObjectOnSchema(sp, child);

            // filter out if the child is undefined
            if (filteredChild === undefined) {
                return;
            }

            // keep the child if it's defined properly or null
            result[key] = filteredChild;
        });
    } else if (type === 'array' && Array.isArray(doc) && schema.items) {
        // check that the doc is also an array
        result = [];
        doc.forEach(function(item) {
            result.push(filterObjectOnSchema(schema.items, item));
        })
    } else {  // literals, or if object/array schema def. vs real thing doesn't match
        result = doc;
    }

    return result;
}
