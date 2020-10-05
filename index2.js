var express= require('express');
var app=express();
//bodyparser

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
const MongoClient=require('mongodb').MongoClient;

let server=require('./server');
let middleware=require('./middleware')

const dbName='hospitalInventory';
const url='mongodb://localhost:27017';
let db
MongoClient.connect(url, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

//fetching hospital details
app.get('/hospital',function(req,res){
    console.log("Collecting data from Hospital Collections");
    var data = db.collection('hospital').find().toArray()
    .then(result => res.json(result));
});

// fetching Ventiolator details
app.get('/ventilators',(req,res) => {
    console.log("Collecting data from Ventilators Collections");
    var ventilators = db.collection('ventilators').find().toArray()
    .then(result => res.json(result));

});

//finding ventilator by name of the hospital
app.post('/searchventilatorbyname',(req,res) => {
    console.log("searching hospital by name");
    var name =req.query.name;
    console.log(name);
    var ventilators = db.collection('ventilators').find({'name':new RegExp(name,'i')}).toArray().then(result => res.json(result));
});


//finding ventilators by status
app.post('/searchventilatorbystatus',(req,res) =>{
    console.log("searching ventilator by status");
    var status = req.body.status;
    console.log(status);
    var ventilators = db.collection('ventilators')
    .find({"status": status}).toArray().then(result => res.json(result));

});

//updating ventilator details 
app.put('/updateventilatordetails',(req,res) =>{
    var ventid = { ventilatorId: req.body.ventilatorId };
    console.log(ventid);
    var newvalues = { $set: { status: req.body.status } };
    db.collection('ventilators').updateOne(ventid, newvalues,function (err, result){
        res.json('document updated');
        if(err) throw err;
    });
});

//add ventilator
app.put('/addventilatorbyuser', (req,res) => {
    var hId= req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;

    var item=
    {
        hId:hId, ventilatorId:ventilatorId, status:status, name:name
    };
    db.collection('ventilators').insertOne(item, function (err, result){
        res.json('new item inserted');
    });
});

//delete ventilator by ventilatorid
app.delete('/delete',(req,res) => {
    var myquery = req.query.ventilatorId;
    console.log(myquery);

    var myquery1 = { ventilatorId: myquery };
    db.collection('ventilators').deleteOne(myquery1,function (err,obj)
    {
        if(err) throw err;
        res.json("document deleted");
    });
});

app.listen(3000);