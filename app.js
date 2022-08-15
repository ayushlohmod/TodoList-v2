
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));


//-------------------------Mongoose-------------------------------------
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String,
})

const Item  = mongoose.model("Item", itemsSchema)
const item1 = new Item({
    name: "welcome to your to do list"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "<--- hit this to delete this item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema)

//---------------------------------------------------------------------

app.get("/", function(req, res){
    

    Item.find({}, function(err,foundItems){

        if(foundItems.length === 0){

            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("Successfully saved defaultItems to your DataBase");
                }
            }) ;
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", Newlistitems: foundItems});
        }
        
    });
    
});

 app.post("/", function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if(listName === "Today"){
        
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName );

        })
    }
});
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){

        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully deleted checked item")
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
                
            }
        })
    }
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })

                list.save();
                res.redirect("/" + customListName);
            }else{
                //show and existing list
                res.render("list", {listTitle: foundList.name, Newlistitems: foundList.items})
            }
        }
    });

});

app.post("/work", function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});