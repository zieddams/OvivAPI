const mongoose =require("mongoose");





const discussionSchema=mongoose.Schema({
    isPaid:{type:Boolean,default:false},
    partners:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    message:[
        {
            sender:mongoose.Schema.Types.ObjectId,
            text:{type:String,trim:true,index:true},
            dateTime:{type:Date, default:Date.now()}
        }
    ],
    createdDate:{type:Date, default:Date.now()}
      

});
const discussion=mongoose.model("discussion",discussionSchema);
module.exports=discussion;


