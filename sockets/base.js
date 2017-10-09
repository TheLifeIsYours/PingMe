const fs = require('fs');
const sanitizer = require('sanitizer');

const pingData = "public/json/ping.json";

module.exports = function (io) {

    io.on('connect', function(client){
        console.log('Client connected...');

        client.on('event', function(data){
            console.log(data);
        });

        client.on('updatePing', function(data){
            io.emit('updatePing', getPing());
        });

        client.on('sendPing', function(newPing){
            let data = getPing();

            //Sanitize the data coming to the server
            newPing = htmlEntities(newPing);

            data.message = newPing;
            data.number += 1;
        
            fs.writeFileSync(pingData, JSON.stringify(data));

            io.emit('updatePing', getPing());
            io.emit('newPing');
        });
    });

}

function getPing() {
    return data = JSON.parse(fs.readFileSync(pingData));
}

function htmlEntities(str) {
    return String(str).replace(/&/g, ' ').replace(/</g, ' ').replace(/>/g, ' ').replace(/"/g, ' ').replace(/nbsp;/gi,'');
}