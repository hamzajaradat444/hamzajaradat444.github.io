var app = require('express')();
var express = require('express')
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://hamzajaradat:11q22w33e@firstapi-xscxv.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require('mongodb').ObjectID;
app.use("/assets", express.static('./assets/'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let availableColors =[]
/* async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}; */
io.on('connection', function(socket){

  io.emit('availableColors',availableColors);

  socket.on('getLoggedInUser',async (loggedInUser)=>{
    await client.connect()
    let res =await client.db('Users').collection('loggedInUsers').findOne({name:loggedInUser.name})
    if(res)io.emit("allowLogin",res)
    else io.emit('error')
    console.log('getLoggedInUser',res,loggedInUser);
  });
  socket.on('saveUser',async (user)=>{
    await client.connect()
    let res = await client.db('Users').collection('loggedInUsers').insertOne(user)
    console.log('saveUser',res.ops);
    if(res)io.emit("allowLoginAfterSave",res.ops[0])
  })
  socket.on('removeUser',async (user)=>{
    await client.connect()
    let res = await client.db('Users').collection('loggedInUsers').deleteOne({name:user.name})
    console.log('afterLogout',res.deletedCount,user);
    if(res.deletedCount)io.emit("afterLogout",user)
  })


    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
      });
     

});
let port  = process.env.PORT||3000
http.listen(port, function(){
  console.log('listening on *:' + port);
});

