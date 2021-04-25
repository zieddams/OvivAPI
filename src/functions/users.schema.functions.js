schemaValidator = module.exports = {}
const validator = require('validator');

schemaValidator.OnlyCharacters = (name) => {
    const myRegxp = /^[a-zA-Z]+$/i;
    return myRegxp.test(name);

}
schemaValidator.isValidEmail = (email) => validator.isEmail(email)
schemaValidator.isValidPhone = (phone) => validator.isMobilePhone(phone)