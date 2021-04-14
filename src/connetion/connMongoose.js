const DB_url = require("../config/config.application").DB_URL;
conn=module.exports={}
const mongoose =require("mongoose");
conn.connect=()=>{mongoose.connect(DB_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})}