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

/* let availableColors =[] */

io.on('connection', function(socket){

  /* io.emit('availableColors',availableColors); */

  socket.on('getLoggedInUser',async (loggedInUser)=>{
    await client.connect()
    let res =await client.db('Users').collection('loggedInUsers').findOne({name:loggedInUser.name})
    if(res)io.emit("allowLogin",res)
    else io.emit('error')
    console.log('getLoggedInUser',res,loggedInUser);
  });
  socket.on('saveUser',async (user)=>{
    await client.connect()
    let res = await client.db('Users').collection('existingPrivateRooms').findOne({privateRoomId:user.privateChatId})
    if(res){
      io.emit("joinReqesut",user)
    }
    else{
      console.log("Room Available");
      let res1 = await client.db('Users').collection('loggedInUsers').insertOne(user)
      let res2 = await client.db('Users').collection('existingPrivateRooms').insertOne({
        owner:user.name,
        privateRoomId:user.privateChatId
      })
      if(res1&&res2)io.emit("allowLoginAfterSave",res1.ops[0])
    }
    
  })
  
  socket.on('removeUser',async (user)=>{
    await client.connect()
    let res1 = await client.db('Users').collection('loggedInUsers').deleteOne({name:user.name})
    let res2 = await client.db('Users').collection('existingPrivateRooms').deleteOne({owner:user.name})
    console.log('afterLogout',res1.deletedCount,user);
    if(res1.deletedCount&&res2.deletedCount)io.emit("afterLogout",user)
  })

  socket.on('sendingJoinRequset',async (user)=>{
    console.log("sendingJoinRequset",user);
    let res = await client.db('Users').collection('existingPrivateRooms').findOne({privateRoomId:user.privateChatId})
    io.emit('joinRequsetSent',{owner:res,user})
  })

  socket.on('sendingAcceptRequset',(user)=>{
    io.emit('joiningAccepted', user);
  })

  socket.on('sendingDeclineRequset',(user)=>{
    io.emit('joiningDeclined', user);
  })
  socket.on('onChatMessage', function(msg){
      io.emit('onChatMessage', msg);
          });
  socket.on('saveUserAfterJoinRequestAccept', (user)=>SaveAfterJoinRequestAccept(user))
     

});
let port  = process.env.PORT||3000
http.listen(port, function(){
  console.log('listening on *:' + port);
});


async function SaveAfterJoinRequestAccept(user){
  await client.db('Users').collection('loggedInUsers').insertOne(user)
}