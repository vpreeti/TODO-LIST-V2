//jshint esversion:6

import express from 'express'
import bodyParser from 'body-parser';
import { mongoose, connect, Schema, model, set } from 'mongoose'
import _ from 'lodash'
mongoose.set('strictQuery', true);
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//connection
mongoose.set('debug', true);
await mongoose.connect('mongodb://127.0.0.1/todolistDB');
console.log("Connected");
const itemsSchema = new Schema({ name: String });
const Item = new model("Item", itemsSchema);
const item1 = new Item({ name: "Welcome to your TODO LIST" });
const item2 = new Item({ name: "Random Item 2" });
const item3 = new Item({ name: "Random Item 3" });
const defaultItems = [item1, item2, item3];

const listSchema = { name: String, items: [itemsSchema] }
const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {
  Item.find({}, function (err, fItem) {
    if (fItem.length === 0) { //insert data to db only once if empty
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully saved to db");
        }

      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: fItem });
    }

  })

});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, function (err, foundList) {
      //if (!err) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      // }
    })
  }

});
//delete checked items
app.post("/delete", function (req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function (err) {
      if (!err) {
        console.log("Successfully deleted the selected item");
        res.redirect("/");
      }

    });
  }
  else {
    ///////////////////////////////////////////////////////////////////
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.pull({ _id: checkedItemID }); 
      foundList.save(function(){

          res.redirect("/" + listName);
      });
    });
    ///////////////////////////////////////////////////////////////////
    // List.findOneAndUpdate({ name: listName }, { $pull: { items: {_id: checkedItemID } } }, function (err, foundList) {
    //   if (!err) {
    //     res.redirect("/" + listName)
    //   }
    // });
  }
});

//realtime page fetch
app.get('/:someText', function (req, res) {

  const customListName = req.params.someText;
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({ name: customListName, items: defaultItems })
        list.save();
        res.redirect("/" + customListName)
      }
      else {
        //show existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }

    }
  })

})
app.listen(3000, function () {
  console.log("Server started on port 3000");
});

