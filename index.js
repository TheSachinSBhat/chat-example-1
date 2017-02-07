'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');
var io = require('socket.io');

var server = http.createServer(function (request, response) {
    var path = url.parse(request.url).pathname;

    switch (path) {
        case '/':
            path = "/index.html";
            break;
        default:
            response.writeHead(404);
            response.write('File not found!');
            response.end();
            break;
    }
});

// Use this while debugging in node-debug
//server.listen(8001);

// Use this while deploying to heroku
server.listen(process.env.PORT);

var listener = io.listen(server);

//global.testContext = 0;
/* Array that holds the location data of all the devices currently connected */
global.deviceLocationData = [];
/* Array that holds the session data for all the connected clients */
global.allClients = [];

listener.sockets.on('connection', function (socket) {
    /* Push the current socket to the allClients array */
    allClients.push(socket);
    var deviceSessionId = allClients.indexOf(socket);

    socket.emit('message', { 'message': 'hello world'});

    socket.emit('deviceSessionData', { 'deviceSessionId': deviceSessionId });

    socket.on('disconnect', function () {
        console.log('Got disconnect!');

        var deviceSessionId = allClients.indexOf(socket);
        /* Remove the session from the allClients array */
        allClients.splice(deviceSessionId, 1);

        /* Remove the location data from the deviceLocationData array */
        deviceLocationData.splice(deviceSessionId, 1);

        // TODO: Convert this into a method - broadcastBusLocationData(socket)
        socket.broadcast.emit('buslocationData', {
            'deviceLocationData': global.deviceLocationData
        });
    });

    socket.on('buslocation', function (busLocation) {

        global.deviceLocationData[busLocation.deviceSessionId] = { 'deviceSessionId': busLocation.deviceSessionId, 'lat': busLocation.lat, 'lng': busLocation.lng };

        // TODO: Convert this into a method - broadcastBusLocationData(socket)
        socket.broadcast.emit('buslocationData', {
            //'deviceSessionId': busLocation.deviceSessionId, 'lat': busLocation.lat, 'lng': busLocation.lng,
            'deviceLocationData': global.deviceLocationData
        });
    });

    socket.on('chat message', function(msg){
    	socket.emit('chat message', msg);
    });
});