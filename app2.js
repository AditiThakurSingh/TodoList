const express= require("express")
const bodyParser = require ("body-parser")
// const { use } = require("express/lib/application")
const mongoose = require ("mongoose")
const _= require ("lodash")
const { urlencoded } = require("body-parser")
require('dotenv').config();
// const { redirect } = require("express/lib/response")
const app = express();

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-adra:slab5@cluster0.9407j.mongodb.net/todolistdb",{useNewUrlParser:true});

const itemsSchema={
    name: String
};

const Item= mongoose.model("Item", itemsSchema);

const task1= new Item ({
    name: "Drink Water",
});

const task2= new Item ({
    name: "Exercise",
});

const task3= new Item ({
    name: "Go to sleep",
});

const defaulttasks = [task1,task2,task3];

const listSchema={
    name: String,
    item: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

// Item.insertMany(defaulttasks, function(err){
//     if(err){
//     console.log("couldnt add documents");
//     } else{
//         console.log("Added successfully");
//     }
// })

app.get("/",function(req,res){

    var date= new Date()
    var daynumber= date.getDay()
    var day= ""
    
    

    var today= new Date();
    var options= 
    {
        weekday:'long',
        day:'numeric',
        month:'long',

    }
    var day= today.toLocaleDateString("en-US",options);
    // console.log(day);
        // res.write("List", {todaysDate: day});
        
        Item.find({}, function(err,foundTasks){
            // console.log(data);
            console.log(err); 
            if(foundTasks.length==0){
                const task1= new Item ({
                    name: " ",
                });
                
                const task2= new Item ({
                    name: "Hi! Start by adding a task below.",
                });
                
                const task3= new Item ({
                    name: "Go to sleep",
                });
                task2.save();

                res.redirect("/")
            } else {
            res.render("List", {listTitle: "Tasks for the day",newitems: foundTasks});
            }
        })
})

app.get("/:customListName",function(req,res){
    // console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName}, function(err,listname){
        if(!err){
            if(!listname){
                // Then create a list of that name.
                // console.log("Doesn't exist");

                const list= new List({
                    name:customListName,
                    item:defaulttasks,
                })
                list.save();
                res.redirect("/"+customListName);

            } else {
                // Then go to that list
                // console.log("Exists");
                // console.log(listname.item);
                res.render("List", {listTitle: listname.name,newitems: listname.item})
            }
        }
    }); 

})

app.post('/', function(req,res){
    
      const newListItem = req.body.listitem;
    //   console.log(newListItem);
    const listName= req.body.listname;

    
      const newTask= new Item ({
          name : newListItem
      })

        if(listName == "Tasks for the day"){
            newTask.save();
            res.redirect("/");
        } else {
            List.findOne({name: listName}, function(err,foundList){
             foundList.item.push(newTask);
             foundList.save();
             res.redirect("/"+ listName);
            })
        }
     
    })

    app.post('/delete',function(req,res){
        // console.log(req.body.deleteTask);
        const deltask= req.body.deleteTask;
        const listName= req.body.listName;

        if(listName == "Tasks for the day"){
        Item.findByIdAndRemove(deltask,function(err,removedTask){
            if(err){
                console.log("error");
            } else {
                console.log("Task removed successfully.");
            }
            res.redirect('/');
        })
        // if(deltask)
    } else {
        List.findOneAndUpdate({name:listName},{$pull: {item:{_id: deltask}}}, function(err,foundList){
            if(!err){
                res.redirect("/"+ listName)
            }
        })
    }
    })

app.get('/work',function(req,res){
    res.render("List", {listTitle: "Work List",newitems: workitems});
})
app.listen(3000,()=>{
    console.log("server started")
})