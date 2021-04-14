serv=require("./src/application/appuse")
const connection=require("./src/connetion/connMongoose");
connection.connect();
serv.initServer();
serv.exeServer();




    