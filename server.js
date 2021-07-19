const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");

//MONDODB connection url
mongoose.connect("mongodb://localhost:27017/data", {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:true
});

//Initializing express
const app = express();

//Initializing body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());


//taken two variables to store counts of add and update API
var tempAdd = 0;
var tempUpdate = 0;

//database schema to store counts of add and update API
const countSchema = new mongoose.Schema({
  countAdd:{
    type:Number,
    default:0
  },
  countUpdate:{
    type:Number,
    default:0
  }
})

//database schema with user details and countSchema to store counts of add and update API
const dataSchema = new mongoose.Schema({
    fName:{
      type:String,
      required:[true,'Please enter first name.']
    },
    lName:{
      type:String,
      required:[true,'Please enter last name.']
    },
    age:{
      type:Number,
      required:[true,'Please enter your age'],
      min: [10, 'Must be at least 10, got {VALUE}'],
    },
    count: countSchema
})

//declaring new model based on dataSchema
const Data = new mongoose.model("Data",dataSchema);

//sample document based on data model
const sampleUser = new Data ({
    fName:"John",
    lName:"Doe",
    age:20,
    count:{
      type: countSchema,
      default: ()=>({})
    }
  });

//sampleUser.save();


//get route to render current details stored in DB
//*********** API EXECUTION TIME = 28ms ***************
app.get("/", (req,res)=>{
    Data.find({},(err,foundData)=>{
      if (!err) {
        res.send(foundData);
      }
      else{
        res.send(err);
      }
    })
})


//put route used as ADD BUTTON - it clears present data and new details in document
//*********** API EXECUTION TIME = 44ms ***************
app.put("/:dataFname",(req,res)=>{
  tempAdd++;
  Data.update(
    {fName:req.params.dataFname},
    {
      fName:req.body.fName,
      lName:req.body.lName,
      age:req.body.age,
      count:{
        countAdd:tempAdd,
        countUpdate: tempUpdate
      }
    },
    {overwrite:true},
    (err)=>{
      if(!err){
        res.send("Updated Successfully")
      }
      else{
        res.send(err);
      }
    }
  );
});


//put route used as UPDATE BUTTON - used to update existing data
//*********** API EXECUTION TIME = 24ms ***************
app.patch("/:dataFname",(req,res)=>{
  tempUpdate++;
  Data.update(
    {fName:req.params.dataFname},
    {
      count:{
        countAdd:tempAdd,
        countUpdate : tempUpdate
      }
    },
    (err)=>{
      if(!err){
        Data.update(
          {fName:req.params.dataFname},
          {
            $set : req.body,
          },
          {overwrite:true},
          (err)=>{
            if(!err){
              res.send("Patched Successfully")
            }
          }
        );
      }
      else{
        res.send(err);
      }
    }
  );

})

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running on 3000");
})
