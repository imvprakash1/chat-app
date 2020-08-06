const socket=io()

const $messageForm=document.getElementById('message-form')
const $sendLocation=document.getElementById('send-location')
const $messageFormInput=document.getElementById('inp')
const $messageFormButton=$messageForm.querySelector('button')
const $messages=document.getElementById('messages');

//templates
const messageTemplate=document.getElementById('message-template').innerHTML;
const locationMessageTemplate=document.getElementById('location-message-template').innerHTML;
const sidebarTemplate=document.getElementById('sidebar-template').innerHTML;


const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    //last message
    const $newMessage=$messages.lastElementChild

    //height of message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight

    //height of messages container
    const containerHeight=$messages.scrollHeight

    //how have i scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(str)=>{
    //console.log(str);
    const html=Mustache.render(messageTemplate,{
        username:str.username,
        message:str.text,
        createdAt:moment(str.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,users
    })
    document.getElementById('sidebar').innerHTML=html;
    
})

socket.on('locationMessage',(url)=>{
    const html=Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message=$messageFormInput.value
    $messageFormInput.value=''
    $messageFormInput.focus()

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        if(error){
            return console.log(error);
        }
        
        
    })
    
})

$sendLocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your Browser')
    }

    $sendLocation.setAttribute('disabled','disabled')

   navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position);
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('Location Shared');
        })
   })
})

socket.emit('join',{
    username,room
},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})