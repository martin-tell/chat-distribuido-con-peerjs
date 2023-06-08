let peer = new Peer();
let websocket;
let peer_id;
let conexiones = [];
let peer_ids = [];

function init(event){
    event.preventDefault();
    setTextArea("Conectando...");
    setTextArea("Eres el peer: "+peer_id);
    websocket = new WebSocket("ws://localhost:8082");
    estados_socket();
}

peer.on('open', function(id){
    peer_id = id;
});

peer.on('connection', function(conexion) { 
    estados_conexion(conexion);
});

peer.on('disconnected', function() { 
    location.reload(); 
});

function estados_conexion(conexion){
    conexion.on('open', function(){
        conexion.on('data', function(data){
            setTextArea(JSON.stringify(data));
        });

        conexion.on('error', function(){
            console.log("Ha ocurrido un error con: "+conexion.peer);
        });

        conexion.on('close', function(){
            console.log(conexion.peer+" ha dejado la conexion.");
        });
    });
}

function estados_socket(){
    websocket.onopen = function(event){
        websocket.send(JSON.stringify({"tipo": 0, "id": peer_id}));
        document.getElementById("texto").disabled=false;
    }

    websocket.onclose = function(event){}
    
    websocket.onmessage = function(mensaje){
        peer_ids_temp = JSON.parse(mensaje.data); 
        peer_ids_temp.forEach(id => {
            if(!peer_ids.includes(id)){
                peer_ids.push(id);
                conexiones.push(peer.connect(id));
            }
        });
    }

    websocket.onerror = function(event){
        console.log("Ocurrió: "+event);
    }
}

function broadcastMessage(paquete){
    for(let conexion of conexiones)
        conexion.send(peer.id+": "+paquete);
}

function enviarTexto(event){
    event.preventDefault();
    let campo = event.target.texto;
    broadcastMessage(campo.value);
    setTextArea("Yo: "+campo.value);
    campo.value="";
}

function setTextArea(data){
    let area = document.getElementById("mensajes")
    area.innerHTML += data + "\n";
}

function desconectar(event){
    websocket.send(JSON.stringify({"tipo": 1, "id": peer_id}));
    websocket.close();
    peer.disconnect();
}