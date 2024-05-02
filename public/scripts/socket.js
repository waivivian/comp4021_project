const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;
    let own_character_id = null;
    let oppo_user = null;
    let oppo_character_id = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");
        });

        // Set up the users event
        socket.on("users", (oppoUsers) => {
            oppo_user = JSON.parse(oppoUsers);
            WaitingOpponentPanel.hide();
            CharacterSelectionPanel.show();
            //onlineUsers = JSON.parse(onlineUsers);
            // Show the online users
            //OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the update oppo character id event
        socket.on("update oppo character id", (oppo_selected_character_id) => {
            oppo_character_id = oppo_selected_character_id;
            // Add the online user
            console.log("oppo_character_id",oppo_character_id);
        });

        // Set up the start game event
        socket.on("start game", (oppo_selected_character_id) => {
            oppo_character_id = oppo_selected_character_id;
            WaitingOpponentPanel.hide();
            console.log("start oppo_character_id",oppo_character_id);
            GamePanel.update(own_character_id,oppo_character_id);
            //////go to game panel!!!!!!!!
            ////
            ////
            ////
        });


        /*// Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);
            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });
        */
        /*// Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);

            // Show the chatroom messages
            ChatPanel.update(chatroom);
        });

        // Set up the add message event
        socket.on("add message", (message) => {
            message = JSON.parse(message);

            // Add the message to the chatroom
            ChatPanel.addMessage(message);
        });

        // Set up the type message event
        socket.on("type message", (name) => {
            if (name != Authentication.getUser().name) { // only show if not the user itself is typing
                ChatPanel.addTyping(name);
            }
        });
        */
        // Update the oppo image of this browser
        socket.on("update oppo image",(image) => {
            CharacterSelectionPanel.update(image);
        });

    };



    // This function will send message to notify server to help us notify our opponent that we have select our character
    const helpChangeOppoImage = function(selected_image_src) {
        console.log("oppo_user",oppo_user);
        if (oppo_user != null){
            socket.emit("change oppo image", JSON.stringify({
                to: oppo_user["username"],
                image: selected_image_src
            }));
        }

    };

    // This function will send message to notify server to help us notify our opponent that we are ready for the game and send our final chosen character id to the opponent
    const ready = function(selected_character_id) {
        own_character_id = selected_character_id; //finalise own chosen character
        if (oppo_character_id != null){ // we can start the game as opponent is also ready
            //socket.emit("chosen character id", selected_character_id);
            socket.emit("game can start", JSON.stringify({ // onlty one of the competining browser will emit this
                to: oppo_user["username"],
                selected_character_id: selected_character_id
            }));
            GamePanel.update(own_character_id,oppo_character_id);

            //////go to game panel!!!!!!!!
            ////
            ////
            ////
        }
        else{ // we only send our final choice of character and the game can not yet be started as opponent still not yet decide the character

            socket.emit("chosen character id",JSON.stringify({
                to: oppo_user["username"],
                selected_character_id: selected_character_id
            }));
            CharacterSelectionPanel.hide();
            WaitingOpponentPanel.show(); // go to wait the opponent user

        }

    };
    
    

    
    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    /*const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    // This function sends a type message event to the server
    const typeMessage = function() {
        if (socket && socket.connected) {
            socket.emit("type message");
        }
    };*/
    return { getSocket, helpChangeOppoImage, ready, connect, disconnect };
})();
