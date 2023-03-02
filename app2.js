const express = require("express");
const bodyParser = require("body-parser");
// const { render } = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const _ = require("lodash");
 
 
const app = express();
 
app.set('view engine', 'ejs');  //for build communication with ejs file
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
 
// global variables
// const itemList= ["Web-dev lectures", "Exam reading", "Complete protein intake", "Book reading"];
const workItem = [];
 
//database 
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
// mongoose.set('useFindAndModify', false)
 
 
const listSchema = new mongoose.Schema({
    name: String
});
 
const Item = mongoose.model("Item", listSchema);
 
// default items
const i1 = new Item({name:"Web-dev lectures"});
const i2 = new Item({name:"Exam reading"});
const i3 = new Item({name:"Complete protein intake"});
const i4 = new Item({name:"Book reading"});
 
// schema for routings
const routingListSchema = {
    name: String,
    items: [listSchema]
};
const List = mongoose.model("List", routingListSchema);
 
 
 
app.get("/", function(req, res){
    
    Item.find({}, function(err, foundItems){
        // console.log(foundItems);
        if(foundItems.length===0){
            Item.insertMany([i1,i2,i3,i4], function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("first 4 data added.")
                }
                res.redirect("/");
            });            
        }else{
            const day = date.getDate();
            res.render("list", {EJSlistTitle: "today", EJSnewitem: foundItems}); // "list" is the name of EJS file in views folder
        }
    });
    // res.send("Temp data");
 
});
 
app.post("/", function(req, res){
    // console.log(req.body.list);
    const listName = req.body.list;
    const additem = new Item({name: req.body.newInput});
    if(listName == "today"){
        additem.save(function(){
 
            res.redirect("/");
        });
    }
    else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(additem)
            foundList.save(function(){
 
                res.redirect("/"+listName); 
            });
        });      
    }
});
 
app.post("/delete", function(req, res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;
    console.log("checkedItemID: "+checkedItemID)
    if(listName ==="today"){
        Item.findByIdAndRemove(checkedItemID, function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Work done successfully!");
                res.redirect("/");
            }
        });
    }else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.pull({ _id: checkedItemID }); 
            foundList.save(function(){
 
                res.redirect("/" + listName);
            });
          });
    }
    
 
});
 
 
app.get("/work", function(req, res){
    res.render("list", {EJSlistTitle: "Work List", EJSnewitem: workItem})
})
app.post("/work", function(req, res){
    // console.log(req.body);
    const item = req.body.newInput;
    workItem.push(item);
    res.redirect("/work")
})
 
 
 
app.get("/about", function(req, res){
    res.render("about");
})
 
 
// routings
// app.get("/custom/:customListName", function(req,res){
app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    if (customListName == "Favicon.ico") return;
    console.log(customListName);
    List.findOne({name:customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                // create new list
                const list = new List ({
                    name:customListName,
                    items:[i1,i2,i3]
                });
                list.save(function(){
 
                    res.redirect("/"+customListName);
                });
            }else{
                // show existing list
                res.render("list", {EJSlistTitle:customListName, EJSnewitem:foundList.items})
            }
        }
    });
 
});
 
app.listen(3000, function(){
    console.log("Yeah, server is running on port 3000");
});