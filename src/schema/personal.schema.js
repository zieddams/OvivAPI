const mongoose =require("mongoose");
//const schemaValidator = require('./../functions/users.schema.functions');

const personalSchema=mongoose.Schema({

    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    percentCompleted:{type: Number},

    skinColor:{type: String},
    hairLength:{type: String},
    hairColor:{type: String},
    hairType:{type: String},
    eyesColor:{type: String},
    length:{type: String},
    weight:{type: String},
    religion:{type: String},
});

const personal =mongoose.model("personal",personalSchema);
module.exports=personal;