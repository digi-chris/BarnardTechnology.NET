﻿function Comms(serverAddress, prefix, CommandLink, onconnect) {
    var ws = new WebSocket("ws://" + serverAddress + "/" + prefix);
    var callbacks = {};

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    ws.onopen = function (event) {
        //console.log("ws open");
        if (onconnect) {
            onconnect();
        }
    }

    ws.onmessage = function (event) {
        //console.log('onmessage');
        //console.log(event.data);
        var respObj = JSON.parse(event.data);
        if (respObj.name === "__response") {
            // this command is a reply
            if (callbacks[respObj.guid]) {
                callbacks[respObj.guid](respObj.arguments[0]);
                delete callbacks[respObj];
            }
        } else if (CommandLink[respObj.name]) {
            // we have a function in the CommandLink
            CommandLink[respObj.name].apply(this, respObj.arguments);
        }
    };

    function SendCommand(commandName, args, callback) {
        var cmdObj = { "name": commandName, "arguments": args };
        cmdObj.TimeSent = new Date();
        cmdObj.guid = guid();
        //console.log("sending " + commandName + " with guid " + cmdObj.guid);
        callbacks[cmdObj.guid] = callback;
        ws.send(JSON.stringify(cmdObj));
    }

    this.SendCommand = SendCommand;
}