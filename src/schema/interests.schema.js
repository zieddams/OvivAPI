const mongoose =require("mongoose");




const interestSchema=mongoose.Schema({
        
        category:{type:String, trim:true, index:true},
        name:{type:String,index:true, unique:true, trim:true,index:true},

});
module.exports=mongoose.model("interest",interestSchema);

