require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const asteriskManager = require('asterisk-manager');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_STRING, { useNewUrlParser: true, useUnifiedTopology:true});
const db = mongoose.connection
db.on('error', (err)=> console.log(err));
db.once('open',()=> console.log('Database MongoDB Connected'));
/*
    Use's express
*/
app.use(cors());

/* 
    Nova conexao com o asterisk 
*/
const ami = new asteriskManager(MANEGER_ASTERISK);
ami.keepConnected(); // Esta opcao tenta reconectar caso perca a conexao com o Asterisk

// Evento de quando a chamada entra na fila
ami.on('queuecallerjoin', evt => {
    console.log("### Emitindo no canal "+evt.queue+" a mensagem: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});

// Evento de quando a chamada sai da fila (quando e atendida ou abandonada)
ami.on('queuecallerleave', evt => {
    console.log("### Emitindo no canal "+evt.queue+" a mensagem: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});

// Evento de quando a chamada e abandonada
ami.on('queuecallerabandon', evt => {
    console.log("### Emitindo no canal "+evt.queue+" a mensagem: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});
  
//Evento de quando o membro da fila (agente) muda de status
ami.on('queuememberstatus', evt => {
    console.log("### Emitindo no canal "+evt.queue+" a mensagem: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});

// Evento de quando a chamada é atendida
ami.on('agentconnect', evt => {
    console.log("### Emitindo no canal "+evt.queue+" a mensagem: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});

// Evento de membros de uma fila (que so aparece quando voce da um queue show na fila)
ami.on('queuemember', evt => {
    console.log("### Emitindo no canal "+evt.queue+" a mensagem: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});

// Evento de parametros de uma fila (que so aparece quando voce da um queue show na fila)
ami.on('queueparams', evt => {
    console.log("### Emitindo no canal "+evt.queue+" a mensagem: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});

ami.on('Hangup', evt => {
    console.log("### Emitindo no canal a mensagem de desligamento da chamada: \r\n "+JSON.stringify(evt)+" \r\n \r\n \r\n");
    io.emit(evt.queue, evt);
});


ami.on("peerstatus", evt => {
  console.log(JSON.stringify(evt));
});

/*
ami.on("dialend", evt => {
  console.log(JSON.stringify(evt));
});


ami.on('newchannel', function(evt) {
    console.log(JSON.stringify(evt));
});

ami.on('hangup', function(evt) {
    console.log(JSON.stringify(evt));
});
*/

ami.on('managerevent', function(evt) {
    console.log(JSON.stringify(evt));
});

/*
    Criar a nossa rota
*/
app.get('/stats', function(req, res) {
    let queue = req.query.queue;
    
        ami.action({
            'action': 'QueueStatus',
            'queue': queue,
        }, function(err, res2){
            if(err){
                console.log("#### ERRO: "+JSON.stringify(err));
            }
    
            if(res2){
              res.statusCode = 200;
              res.send(res2);
            }
        });
    }
);



/* 
    Init do webserver
*/
http.listen(3000, () => {
    console.log("Backend is online in port 3000");
})

