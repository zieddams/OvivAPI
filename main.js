const app = require("./src/app/appuse")
const connection = require("./src/connection/connMongoose")
connection.connect()
app.initServer()
app.runServer()