const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;
    let oppo_user = null;

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
            oppo_user = oppoUsers;
            console.log("hhhhh",oppo_user);
            //onlineUsers = JSON.parse(onlineUsers);
            // Show the online users
            //OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
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

        // Set up the messages event
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

        // Update the oppo image of this browser
        socket.on("update oppo image",(image) => {
            CharacterSelectionPanel.update(image);
        });

    };


    // This function disconnects the socket from the server
    /*const helpChangeOppoImage = function(selected_image_src) {
        CharacterSelectionPanel.update(selected_image_src);
    };
*/
    // This function disconnects the socket from the server
    const helpChangeOppoImage = function(selected_image_src) {
        //////Error here oppo_user is undefined even defined in line 26
        if (oppo_user != null){
            console.log("hhhh",oppo_user);
            socket.emit("change oppo image", JSON.stringify({
                to: oppo_user["username"],
                image: selected_image_src
            }));
        }

    };
    

    
    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    // This function sends a type message event to the server
    const typeMessage = function() {
        if (socket && socket.connected) {
            socket.emit("type message");
        }
    };
    return { getSocket, helpChangeOppoImage, connect, disconnect, postMessage, typeMessage };
})();
