//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://prathamkhandelwal:prathamk1234@cluster0.8zfzayj.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
  name:String
});

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name: "Jim"
});

const item2 = new Item({
  name: "Diet"
});

const item3 = new Item({
  name: "Coding"
});

const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {

  async function findItem(){
    try{
        const allItems =  await Item.find({});
        if(allItems.length == 0){                                  //if and else isliye lagaye hai kyuki agr pehle se koi item agr nahi hai list me toh usme 3 items apne app add hojayenge 
             Item.insertMany(defaultItems)
             .then(function () {
             console.log("Successfully saved defult items to DB");
              })
             .catch(function (err) {
             console.log(err);
             });
             res.redirect("/");     //ye isliye hai kyuki taaki browser ko redirect kr ske home route pe taaki items render ho sake but iss baar vo if condition pe nahi balki else pe jaayega kyuki list me 3 items pehle se hi honge.
        }
        else{
          res.render("list", {listTitle: "Today", newListItems: allItems});
        }
    }
    catch(err){
        console.log(err);
    }
};
findItem();
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(()=> {
        res.redirect("/");
    })
    .catch((err)=>{
        console.log(err);
    });
  } 
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}})
    .then(function(foundlist){
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/",async function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();                //trim isliye lagaya hai taaki items add kr sake dusri lists me 
  const item4 = new Item({
  name: itemName
 });

 if(listName === "Today"){
  item4.save();
  res.redirect("/");
 }else{
await List.findOne({name: listName}).exec()
.then(function(foundList){
  foundList.items.push(item4);
  foundList.save();
  res.redirect("/" + listName);
})
 }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
