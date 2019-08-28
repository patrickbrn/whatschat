var url = 'http://34.243.3.31:8080';
var idc=1; //channelid variable page.totalelements +1
var page=0; // Channelseite

//wenn Dokument vollständig geladen einmal Channel Liste auflisten
document.addEventListener("DOMContentLoaded", function(event) {
    fetch(url + "/channels",{
        headers: new Headers({
            'X-Group-Token': 'ghwPcrQQYrPl'
        })
    })
        .then(response => response.json())
.then(data => {
        var idc=data.page.totalElements +1; //id des letzen Channels + 1 damit nix überschrieben wird
    var idp=data.page.totalPages -1;
    getChannels(0);


})


});



//Aktualisierung jede 10 Sekunde
setInterval(function(){			//in jedem Intervall von 10 Sekunden wird die Get Methode aufgerufen
    //Liefert Liste von Channels
    $.ajax({
        url: url + "/channels",
        type:'GET',
        headers:{
            "X-Group-Token": "ghwPcrQQYrPl"
        },
        statusCode: {
            200: function() {
                console.log("Status-Code: 200 OK");
            }
        },
        dataType: 'json',
        success: getChannels(0)

    });
}, 10000); //alle 10 sekunden soll die Get methode aufgerufen werden




//Listet alle Channels auf immer jeweils maximal 20 Channels aufeinmal
//mit den Buttons können jeweils die Seiten gewechselt werden
function getChannels(page){
    fetch(url+ "/channels?page=" + page +"&size=20", {
        headers: new Headers({
            'X-Group-Token': 'ghwPcrQQYrPl'
        })
    })
        .then(response => response.json())
.then(data => {
        let result= '<h2> Channels</h2>';
    var page1="<button id=page onclick=getChannels(0) >Erste Seite</button> <br>"; //button um erste Seite aufzurufen
    var page2="<button id=page onclick=getChannels(page=page+1)>Nächste Seite</button> <br>"; //button um  nächste seite Aufzurufen
    var page3="<button id=page onclick=getChannels(page=page-1)>Zurück</button> <br>"; //button um zurück zu gehen



    var channels = data._embedded.channelList; //speichern die Liste in channels ein
    //für jedes Obekt wird ein Button erstellt mit dem Channelnamen und für jeden Button wird eine onclick methode festgelegt und jeweils die Channelid gegeben
    //beim clicken auf den Button werden die message zum gegebenen Channel angegeben
    channels.forEach(function(channelElement){
        result += ` <button id=channel onclick=getMessage(id=${channelElement.id}) >${channelElement.name} Topic: ${channelElement.topic}</button> <br>`;
    });

    //Ausgabe
    document.getElementById('outputChannel').innerHTML= page1+page2+page3+result;

})
.catch(function() {
        alert("Letzte Seite angekommen");
        location.reload(true);//Seite neu Laden
    });

};


//Erstelle ein Channel hängt das Channel ganz hinten an
function createChannel(idc){
    //Speichere Wert aus Name und Topic
    var name = $('#name').val();
    var topic = $('#topic').val();

    //asynchronous HTTP request
    $.ajax({
        url: url + "/channels",
        type: 'POST',
        headers:{
            "X-Group-Token": "ghwPcrQQYrPl"
        },
        contentType: 'application/json',
        data: JSON.stringify( { "id": idc, "name": name, "topic": topic} ),

        statusCode: {
            201: function() {
                console.log("Status-Code: 201 Created");
                getChannels(0); //aktuallisiert dei Channelliste
            },
            409: function() { //falls ein Channel mit gleichem Namen existiert, einen Konflikt-Fehlerstatus zurück
                alert("Status-Code: 409 Conflict ->  Channel mit gleichem Namen existiert");
            }
        }
    })
    idc = idc+1;
};

var username="";
//wird aufgerufen wenn auf Button von Channel gedrückt wird, erhält die Id des Channels
function getMessage(id){
    //username abfrage
    while(username==""){ // wenn username leer
        username = prompt('Gebe ein Usernamen ein', '');
    }

    getUsers(id); //ruft getUsers auf um die User in diesem Channel anzuzeigen

    fetch(url + "/channels/" + id +"/messages",{
        headers: new Headers({
            'X-Group-Token': 'ghwPcrQQYrPl'
        })
    })
        .then(response => response.json())
.then(data => {
        let result= '<h2> Message</h2>';
    let msg;
    let thema;


    //Kommentarfeld mit click auf Senden wird sendMessage aufgerufen und die Nachricht wird auf den Server geschickt
    msg=`<h2>Kommentar:</h2>
 			<form id="myForm" >
	    		<span>Name:</span><input id="creator" value=${username} /></span>
	    		<span>Post:</span> <textarea id="content"></textarea>
	    		<input id="submitbutton" type="button" value="Senden"  onclick="sendMessage(${id})"/>
			</form>`;

    var message = data._embedded.messageList;
    console.log(message[0].channel.name);
    thema= `<h1 id=ueberschrift>Name: ${message[0].channel.name}</h1>
				<h1 id=ueberschrift>Topic: ${message[0].channel.topix}</h1>`;

    message.forEach(function(messageElement){
        var d = new Date(messageElement.timestamp); //erstelle Date objekt
        d.getTimezoneOffset(); //Die getTimezoneOffset() Methode gibt den Unterschied zwischen der aktuellen Ortszeit (Einstellungen des Hostsystems) und der Weltzeit (UTC) in Minuten zurück


        result += ` <ul id=messageliste><li id=creator >Creator: ${messageElement.creator} <li id=content>Content: ${messageElement.content}<li id=timestamp> ${d} </ul>` ;

    });

    document.getElementById('message').innerHTML=thema+ msg + result;

})
.catch(function() { //Falls keine Nachrichten zum Anlegen möglich ist, gebe Fehlermeldung aus
        alert("Error 404 Page not found ");
    });

};


var idm =1; //id für messages
//wird aufgerufen wenn neuer Kommentar geschickt wird
function sendMessage(id){

    //Speichere Wert aus Creator und content
    var creator = $('#creator').val();
    var content = $('#content').val();
    console.log(content);
    console.log(creator);

    $.ajax({
        url: url + "/channels/"+id+ "/messages",
        type: 'Post',
        headers:{
            "X-Group-Token": "ghwPcrQQYrPl"
        },
        contentType: 'application/json',
        data: JSON.stringify( { "id": idm, "creator": creator, "content": content} ),
        statusCode: {
            200: function() {
                console.log("Status-Code: 200 OK");
                getMessage(id); //gebe die neuen Nachrichten im Channel aus
                idm++;	//inkrementiere idm um 1, damit man die messages sortiert anzeigen kann
            },
            404: function() { //falls ein Channel mit gleichem Namen existiert, einen Konflikt-Fehlerstatus zurück
                alert("Status-Code: 404 Not Found");
            }
        },

    })


}



//erhalte die users
function getUsers(id){
    fetch(url + "/channels/" + id +"/users",{
        headers: new Headers({
            'X-Group-Token': 'ghwPcrQQYrPl'
        })
    })
        .then(response => response.json())
.then(data => {
        let result= '<h2> User</h2>';
    var user = data;
    user.forEach(function(userElement){
        result += ` <ul> <li>Nutzer:${userElement} </ul>` ;  //alle uses in liste speichern

    });
    document.getElementById('user').innerHTML=result; //Ausgabe
})

}
