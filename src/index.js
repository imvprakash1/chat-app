const express=require('express')
const http=require('http')
const path=require('path')
const socketio=require('socket.io')
const { Socket } = require('net')
const Filter=require('bad-words')
const {generateMessage,generateLocataionMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT||3000
const publicPath=path.join(__dirname,'../public')

app.use(express.static(publicPath))




io.on('connection',(socket)=>{
    
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }


        socket.join(user.room)
        socket.emit('message',generateMessage("Admin",`Welcome ${user.username}`))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(msg,callback)=>{
        const filter=new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        const user=getUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,msg))//168
            callback('Delivered')
        }

    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage("Admin",`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation',(pos,callback)=>{
        const user=getUser(socket.io)
        
        io.to(user.room).emit('locationMessage',generateLocataionMessage(user.username,`https://google.com/maps?q=${pos.latitude},${pos.longitude}`))
        callback()
    })
})
server.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
    
})