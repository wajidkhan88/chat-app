const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')
// const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Get the height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visisbleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visisbleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on('message',(msg)=>{
    //console.log(msg)
    const html = Mustache.render(messageTemplate,{
        username:msg.username,
        message1:msg.text,
        createdAt:moment(msg.createdAt).format('hh:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    //console.log(url)
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        location1:url.url,
        createdAt:moment(url.createdAt).format('hh:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    //diasble 
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(err)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        //diasble 
        if(err){
            console.log(err)
        }else{
            console.log('the message was delivered')
        }
        
    })
})

const $sendLocationButton = document.querySelector('#send-location')
$sendLocationButton.addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        return alert('Geo Location is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('Location Shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
