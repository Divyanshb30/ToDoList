//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const _ = require("lodash");
const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://divyansh30:Div123@div0.yap2rgl.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to you To-Do-List!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this button to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  

  Item.find({})
    .then(foundItems => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(result => {
            console.log("added default items");
          })
          .catch(err => {
            console.log(err);
          });
        res.redirect("/");
      }
      else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
  .catch(err => {
    console.log(err);
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({ name: listName }).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
        
      });
  }

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(result => {
        console.log("successfully deleted item");
        res.redirect("/");
      });
  }
  else {
    List.updateOne({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(result => {
      res.redirect("/" + listName);
    });
  }
    
 
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        setTimeout(() => { res.redirect('/' + customListName);}, 1000);
        
        
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
    })
    .catch((err) => {
      console.log(err);
  })
  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port");
});

