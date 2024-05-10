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
        });

        // Set up the update oppo character id event
        socket.on("update oppo character id", (oppo_selected_character_id) => {
            oppo_character_id = oppo_selected_character_id;
            // Add the online user
        });

        // Set up the start game event
        socket.on("start game", (oppo_selected_character_id) => {
            oppo_character_id = oppo_selected_character_id;
            WaitingOpponentPanel.hide();
            GamePanel.update(own_character_id,oppo_character_id, own_name, oppo_user["name"]);
        });



        socket.on("own information", (own_user) => {

            const {username, name} = JSON.parse(own_user);
            own_username = username;
            own_name = name;
        });


  
        // Update the oppo image of this browser
        socket.on("update oppo image",(image) => {
            CharacterSelectionPanel.update("./image/"+image);
        });

        // This function is used when a player have its opponent disconnected
        socket.on("restart game due to disconnected_oppo",() => {
            //forget about previous player
            alert("Your opponent is disconnected! Now you will need to wait for another opponent.");

            oppo_user = null;
            oppo_character_id = null;
            GamePanel.end_game();

            WaitingOpponentPanel.show();
            CharacterSelectionPanel.hide();
            socket.emit("available to match with another user", own_username);
        });

	
        socket.on("food type generated",(food_type_generated) => {
            Food.update(food_type_generated);
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
				GamePanel.own_moveforward();
				setTimeout(GamePanel.own_moveback, 1000);
			}
			else{
                GamePanel.oppo_moveforward();	
				setTimeout(GamePanel.oppo_moveback, 1000);
			}
    	});

		socket.on("rest", ()=>{
			GamePanel.rest(); // don't let user to move
		});
		
        socket.on("disconnect due to reload", (disconnected_username)=>{
            if (oppo_user["username"]){
                if (disconnected_username == oppo_user["username"]){ // if your oppo_user does not sign out as well
                    socket.emit("notify oppo user about disconnect",own_username, false); // notify oneself as the disconnect user cannot notify you
                }
                oppo_user = null;
                oppo_character_id = null;
            GamePanel.end_game();
            }

        });
		
		socket.on("start", ()=>{
			GamePanel.start();
		});
		socket.on("update", (username)=>{

			if(username === own_name){
				
				GamePanel.ownScored();
				
			}
			
			else{
				
				GamePanel.oppoScored();	
				
			}
		});
		
		socket.on("update the boost", (username)=>{
		

			if(username === own_name){
				
				GamePanel.ownUse();
				
			}
			
			else{
				
				GamePanel.oppoUse();	
				
			}
		});
		
		
		

    };



    // This function will send message to notify server to help us notify our opponent that we have select our character
    const helpChangeOppoImage = function(selected_image_src) {
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
	

	const signal = function(username){ // a signal tell server I move to the food
		if (socket){
			socket.emit("signal",username);
	
		}
	};
	
	const restforever = function(){ // call when someone win
		if (socket){
		socket.emit("restforever");	
		}
	};
    // This function disconnects the socket from the server
    const disconnect = function() {
        if (oppo_user){ // if your oppo_user does not sign out as well
            socket.emit("notify oppo user about disconnect",oppo_user["username"], true); // disconnect with oppo user
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

    const times_up = function() {
        //forget about previous player
        socket.emit("times up");
    };

	
	const x2boost_uesd = function(){
		
		
		socket.emit("x2boost used" , own_name);
		
		
	}
	
	
    return { getSocket, connect, helpChangeOppoImage, ready,  disconnect, cal_rank, restart_game,signal,restforever, times_up ,x2boost_uesd};
	
})();
