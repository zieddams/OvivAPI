const cjson = require('compressed-json')
const jsonpack = require('jsonpack/main')

const encrypt = (data) => {
    /*r = cjson.compress(data)
    return r*/
};

const decrypt = (data) => {
    /*result = cjson.decompress(data)
    return result*/
};

module.exports = {
    encrypt,
    decrypt
};