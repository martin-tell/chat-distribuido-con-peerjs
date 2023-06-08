const { WebSocketServer } = require("ws");
const WebSocket = require("ws");
const wss = new WebSocketServer({port: 8082});
let conectados = [];

wss.on("connection", ws => {
    console.log("New client connected");

    ws.on('message', function(paquete) {        
        p = JSON.parse(paquete);
        if(p['tipo'] == 0){
            let idx = conectados.indexOf(p['id']); 
            if (idx === -1) {
                conectados.push(p['id']);
                wss.broadcast(JSON.stringify(conectados));
            }        
        }

        if(p['tipo'] == 1){
            let idx = conectados.indexOf(p['id']); 
            if (idx !== -1) {
                conectados.splice(idx, 1);
                wss.broadcast(JSON.stringify(conectados));
            }
        }
        console.log(conectados);
    });

    ws.on("close", (id) => {});
});

wss.broadcast = (msg) => {
    wss.clients.forEach(client => client.send(msg));
};