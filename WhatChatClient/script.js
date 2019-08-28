//constant variables
const url = 'http://localhost:8080';
const token = 'ghwPcrQQYrPI' 

//global variables
let activeChannel; 
let username = 'user_x';
let lastSeenTimestamp= '1970-01-01T00:00:00Z';
let page = 0;
let largestId = 0;
let helperId = 0;

//initialize
$(document).ready(function() {
    getChannels();
    document.getElementById('createChannel').addEventListener('click', createChannel);
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('prev').addEventListener('click', () => {updatePage('prev')} );
    document.getElementById('next').addEventListener('click', () => {updatePage('next')});

    setInterval( () => {getChannels(page)}, 10000);
    setInterval( () => {updateMessages(activeChannel)}, 1000);
    setInterval( () => {getUsers(activeChannel)}, 10000);
});


/* **************************************************
       1. Channel Erstellen
***************************************************** */
function createChannel(){
    let chName = prompt("Please enter the channel name:", "channel_1");
    let chTopic = prompt("Please enter the channel topic:", "topic_1");
    $.ajax({
        url: url + '/channels',
        type: 'POST',
        crossDomain:true,
        headers: {'X-Group-Token': token},
        contentType: 'application/json',
        data: JSON.stringify( { "name": chName, "topic": chTopic } ),
        success: function() { alert('Channel added!'); }
    })
}


/* **************************************************
       2. Channels Darstellen
***************************************************** */
function getChannels(){
    $.ajax({
            url: url + '/channels?page='+ page +'&size=50',
            type: 'GET',
            dataType: 'json',
            crossDomain:true,
            headers: {'X-Group-Token': token,'Access-Control-Allow-Origin':'*', 'withCredentials': 'true'},
            success: function (channels){
                document.getElementById("channels").innerHTML="";
                let channelsList = channels._embedded.channelList.reverse();
                $.each((channelsList), function (i, item) {
                    let newListElement = document.createElement('li');
                    newListElement.innerHTML = item.name;
                    newListElement.addEventListener('click', () => {joinChannel(item.id)} );
                    document.getElementById('channels').appendChild(newListElement);
               });
            }
        }
    )
}

//Navigate through channels using pagination
function updatePage(reference){
    if(reference === 'next'){
        page++;
    }
    if(reference === 'prev'){
        if(page > 0){
            page--;
        }
    }
    getChannels(page); 
}

/* **************************************************
       3. Channel Bei- und Austreten
***************************************************** */
function joinChannel(id){
    let oldUn = username;
    username = prompt("Please enter a user name:", "user_x");
    if(username === ""){
        joinChannel(id);
    }else if(username == null || username == undefined){
        username = oldUn
    }else{
        activeChannel = id;
        getChannelInfo(id);
        getUsers(id);
        getInitialMessages(id);
    }
}

//topic and channel name
function getChannelInfo(id){
    document.getElementById('channelInfo').innerHTML = '';
    $.ajax({
        url: url + '/channels/' + id,
        type: 'GET',
        headers: {'X-Group-Token': token},
        dataType: 'json',
        success: function(json){
            let chName = document.createElement('div');
            chName.innerHTML = 'Channel Name: ' + json.name; 
            let chTopic = document.createElement('div');
            chTopic.innerHTML = 'Channel Topic: ' + json.topic;
            document.getElementById('channelInfo').appendChild(chName);
            document.getElementById('channelInfo').appendChild(chTopic);
        }
    })
}

//channel users
function getUsers(id){
    if(id != undefined){
        document.getElementById('users').innerHTML = '';
        $.ajax({
            url: url + '/channels/' + id + '/users',
            type: 'GET',
            headers: {'X-Group-Token': token},
            dataType: 'json',
            success: function(json){
                $.each((json), function(i, item){
                    let user = document.createElement('div');
                    user.innerHTML=item;
                    document.getElementById('users').appendChild(user);
                })
            }
        })
    }
}

// 10 initial messages
function getInitialMessages(id){
    if(id != undefined){
        document.getElementById('messages').innerHTML = '';
        $.ajax({
            url: url + '/channels/' + id + '/messages',
            type: 'GET',
            headers: {'X-Group-Token': token},
            dataType: 'json',
            success: function (json){
                if( json._embedded != undefined){
                    $.each((json._embedded.messageList), function (i, message) {
                            let messageDiv = constructMessageDiv(message);
                            document.getElementById('messages').append(messageDiv);
                            if(message.id >= helperId){
                                helperId = message.id;
                           }
                    })
                    lastSeenTimestamp = json._embedded.messageList[0].timestamp;
                    largestId = helperId;
                }
            }
        })
    }
}

/* **************************************************
       4. Nachrichten Darstellen
***************************************************** */
// messages since last timestamp
function updateMessages(id){
    if(id != undefined){
        $.ajax({
            url: encodeURI(url + '/channels/' + id + '/messages?lastSeenTimestamp=' + lastSeenTimestamp+ '&page=50'),
            type: 'GET',                
            headers: {'X-Group-Token': token},
            dataType: 'json',
            success: function (json){
                if( json._embedded != undefined){
                    let newMessages = document.createElement('div');
                    $.each((json._embedded.messageList), function (i, message) {
                        if(message.id > largestId){   
                            let messageDiv = constructMessageDiv(message);
                            newMessages.append(messageDiv);
                        }
                        if(message.id >= helperId){
                            helperId = message.id;
                       }
                    })
                    document.getElementById('messages').prepend(newMessages);
                    lastSeenTimestamp = json._embedded.messageList[0].timestamp; 
                    largestId = helperId;
                }
            }
        })
    }
}

//build html message element
function constructMessageDiv(jsonMessage){
    let message = document.createElement('div');
   
    let author = document.createElement('div');
    author.className = 'messageAuthor';
    author.innerHTML = jsonMessage.creator;
    message.appendChild(author);

    let content = document.createElement('div');
    content.className = 'messageContent';
    content.innerHTML = jsonMessage.content;
    message.appendChild(content);

    let timestamp = document.createElement('div');
    timestamp.className = 'messageTimestamp';
    timestamp.innerHTML = calcTimestamp(jsonMessage.timestamp);
    message.appendChild(timestamp);

    return message;
}

function calcTimestamp(date){
    let time = parseInt(date.substring(11,13)) +2;
    let first = date.substring(0,11);
    let last = date.substring(13, 21);
    let newTime= first + time + last;    
    return newTime;
}

/* **************************************************
       5. Nachrichten verschicken
***************************************************** */
function sendMessage(){
    if(activeChannel != undefined){
    let messageText = document.getElementById('messageText').value;
    $('#messageText').val('');
    $.ajax({
        url: encodeURI(url + '/channels/' + activeChannel + '/messages?lastSeenTimestamp=' + lastSeenTimestamp),
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({"creator" : username, "content" : messageText}),
        headers: {'X-Group-Token': token},
        success: function (json){
            if( json._embedded != undefined){
                let newMessages = document.createElement('div');
                $.each((json._embedded.messageList), function (i, message) {
                    if(message.id > largestId){   
                        let messageDiv = constructMessageDiv(message);
                        newMessages.appendChild(messageDiv);
                   }
                   if(message.id >= helperId){
                    helperId = message.id;
                   }
                })
                document.getElementById('messages').prepend(newMessages);
                lastSeenTimestamp = json._embedded.messageList[0].timestamp; 
                largestId = helperId;
            }
        }
    })
    }
}
