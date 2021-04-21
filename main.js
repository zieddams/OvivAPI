const app = require("./src/application/appuse")
const connection = require("./src/connetion/connMongoose");
connection.connect();
app.initServer();
app.exeServer();