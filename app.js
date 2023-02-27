//jshint esversion:6

import express from 'express'
import bodyParser from 'body-parser';
import { mongoose,connect, Schema, model, set } from 'mongoose'
mongoose.set('strictQuery', true);
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//connection
mongoose.set('debug', true);
await mongoose.connect('mongodb://127.0.0.1/todolistDB');
console.log("Connected");
 const itemsSchema = new Schema({ name: String });
 const Item = new model("Item", itemsSchema);
 const item1 = new Item({ name: "Welcome to your TODO LIST"});
 const item2 = new Item({ name: "Random Item 2"});
 const item3 = new Item({ name: "Random Item 3"});
 const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {
Item.find({},function(err,fItem){
  if(fItem.length===0){ //insert data to db only once if empty
 Item.insertMany(defaultItems,function(err){
  if(err){
      console.log(err);
  }
      else{
          console.log("Successfully saved to db");
      }
  
});
res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: fItem});
  }
  
})
  
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const item= new Item({ name: itemName});
  item.save();
 res.redirect("/");
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
