const axios = require('axios');
const bcrypt = require("bcryptjs");
const User = require("../schema/user.schema");
const userFunctions = require("../functions/user.functions");

module.exports.createRandomUser = () => {
    try {

        axios.get('https://randomuser.me/api/?results=175').then(response => {
            console.log("userData", response.data.results.length)
            let users = [];
            response.data.results.forEach(element => {
                const {
                    first,
                    last
                } = element.name;
                let name = {
                    username: element.login.username,
                    firstName: first,
                    lastName: last
                };
                let email = {
                    value: element.email
                }
                let birth = {
                    birthday: element.dob.date,
                    age: element.dob.age
                }

                let salt = bcrypt.genSaltSync(10)
                let hashPassword = bcrypt.hashSync("123456", salt)
                let password = {
                    value: hashPassword
                }
                let gender = element.gender;
                let address = {
                    country: element.location.country
                }
                let created_date = element.registered.date;
                const secretCode = userFunctions.createSecretCode()
                const newUser = {
                    name,
                    email,
                    birth,
                    password,
                    gender,
                    address,
                    created_date,
                    secretCode,
                    oviv_currency: 100
                }
                users.push(newUser);
            });
            User.insertMany(users).then(() => {
                console.log("Data inserted")
                return;
            }).catch(err => {
                console.log(err)
                return;
            })
        })

    } catch (error) {
        console.log(error)
    }

}