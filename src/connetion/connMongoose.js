conn=module.exports={}
const mongoose =require("mongoose");
conn.connect=()=>{mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})}