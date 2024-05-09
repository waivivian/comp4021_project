const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;
    let own_character_id = null;
    let own_username = null;
    let own_name = null;
    let oppo_user = null;
    let oppo_character_id = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();
        console.log("socket.....",socket);
        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");
            // Get the chatroom messages
            //socket.emit("get messages");
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
            GamePanel.update(own_character_id,oppo_character_id, own_name, oppo_user["name"]);
            //////go to game panel!!!!!!!!
            ////
            ////
            ////
        });

        // Set up the update oppo score event
        /*socket.on("update oppo move and score", () => {
            GamePanel.update_oppo();
        });*/

        socket.on("own information", (own_user) => {
            // Get the online user list
            //socket.emit("get users");
            const {username, name} = JSON.parse(own_user);
            own_username = username;
            own_name = name;
            // Get the chatroom messages
            //socket.emit("get messages");
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

        // This function is used when a player have its opponent disconnected
        socket.on("restart game due to disconnected_oppo",() => {
            //forget about previous player
            alert("Your opponent is disconnected! Now you will need to wait for another opponent.");
            console.log(":( my oppo user quit");
            oppo_user = null;
            oppo_character_id = null;
            GamePanel.end_game();
            WaitingOpponentPanel.show();
            //GamePanel.hide();
            CharacterSelectionPanel.hide();
            socket.emit("available to match with another user", own_username);
        });

	
        socket.on("food type generated",(food_type_generated) => {
            Food.update(food_type_generated);
            //console.log("new food");
        });

        socket.on("added to available list", () => {
            // Get the online user list
            socket.emit("get users");
            // Get the chatroom messages
            //socket.emit("get messages");
        });

        
        socket.on("ranking result", (game_rank) => {
            GameOverPanel.update(game_rank);
            console.log("rank hiiii");
        });
		
		
		socket.on("no one eat", ()=>{
		
			GamePanel.noOneEat();
			

		});
		
        socket.on("move back without food", (username)=>{
			if(username === own_name){
				setTimeout(GamePanel.own_moveback(), 1000);
			}
			else{
                GamePanel.oppo_moveforward();	
				setTimeout(GamePanel.oppo_moveback, 1000);
			}
    	});

		socket.on("rest", ()=>{
			GamePanel.rest(3000);
		});
		
		socket.on("start", ()=>{
			GamePanel.start();
		});
//////////////////////////////////		
		socket.on("update", (username)=>{
			/*
			console.log(username === own_name);
			console.log(username);
			console.log(own_name);
			console.log(oppo_character_id);
			console.log(oppo_user);
			*/

			if(username === own_name){
				
				GamePanel.ownScored();
				
			}
			
			else{
				
				GamePanel.oppoScored();	
				
			}
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
            GamePanel.update(own_character_id,oppo_character_id, own_name, oppo_user["name"]);
            CharacterSelectionPanel.hide();
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
    
    // This function will notify server to tell opposite browser about my move and my updated score
	
	/*
    const update_oppo_own_move = function() {
        if (oppo_user != null){
            socket.emit("update oppo about my move", oppo_user["username"],);
        }
    };
    
    const generatefoodtype = function() {
        if (socket){
            socket.emit("generate food type");
        }
    };

    const generate_timeout_foodtype = function() {
        if (socket){
            socket.emit("generate food type due to timeout");
        }
    };    
	
*/
///////////////////////////////////////////////////////	
	const signal = function(username){ // a signal tell server I move to the food
		if (socket){
			socket.emit("signal",username);
	
		}
	};
	
	const restforever = function(){
		if (socket){
		socket.emit("restforever");
		
		}
	};
    // This function disconnects the socket from the server
    const disconnect = function() {
        if (oppo_user){ // if your oppo_user does not sign out as well
            console.log(own_username+"disconnected",oppo_user["username"]);
            socket.emit("notify oppo user about disconnect",oppo_user["username"]); // disconnect with oppo user
        }
        socket.disconnect(); // disconnect with server
        socket = null;
        own_character_id = null;
        own_username = null;
        own_name = null;
        oppo_user = null;
        oppo_character_id = null;
        GamePanel.end_game();
    };

    // only winner should call this function -This function notify server to calculate ranking
    const cal_rank = function(time_used) {
        socket.emit("get ranking", own_username, oppo_user["username"], own_name, oppo_user['name'], time_used);
    };

    // This function notify server that this user is availbale to match with another user
    const restart_game = function() {
        //forget about previous player
        oppo_user = null;
        oppo_character_id = null;
        socket.emit("available to match with another user", own_username);
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
    return { getSocket, connect, helpChangeOppoImage, ready,  disconnect, cal_rank, restart_game, signal,restforever};
	
})();
