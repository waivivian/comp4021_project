const SignInForm = (function() {
    let own_player =null;
    let oppo_player = null;

    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        //Avatar.populate($("#register-avatar"));
        
        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    //CharacterSelectionPanel.show();
                    WaitingOpponentPanel.show();
                    UserPanel.show();
                    Socket.connect(); 
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            //const avatar   = $("#register-avatar").val();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();
            console.log("yyyhhhhhh", name, password);
            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const WaitingOpponentPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#waiting-opponent").hide();
        // Click event for the start game button
    };

    // This function shows the form with the user
    const show = function() {
        $("#waiting-opponent").show();
        
    };

    // This function hides the form
    const hide = function() {
        $("#waiting-opponent").hide();
    };

    return { initialize, show, hide };
})();


const CharacterSelectionPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#character-selection").hide();
        //const characters = document.querySelectorAll('.character');

        const characters = document.getElementsByClassName('character');

        // Convert HTMLCollection to an array-like object
        const charactersArray = Array.from(characters);
        
        // The index of the character selected
        let characterId = null;
        // Use forEach on the array-like object
        charactersArray.forEach(character => {
            character.addEventListener('click', () => {
                characterId = character.id;
                console.log(characterId);
                // change the chosen-character image to the  selected character's image
                selected_image_src = document.getElementById(characterId).childNodes[1].src;
                $("#own-chosen-character-image").attr("src",selected_image_src);
                console.log("selected_image_src",selected_image_src);
                Socket.helpChangeOppoImage(selected_image_src);  
            });
        });
        // Click event for the start game button
        $("#versus-button").on("click", () => {
            if (characterId){ //ensure the user have chosen a character before clicking versus
                Socket.ready(characterId);
                hide();
            }
            else{
                alert("Choose a character first!!!");
            }


        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#character-selection").show();
    };

    // This function hides the form
    const hide = function() {
        $("#character-selection").hide();
    };

    // This function updates the user panel
    const update = function(selected_image_src) {
        $("#enemy-chosen-character-image").attr("src",selected_image_src);
    };

    return { initialize, show, hide, update };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();
                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            //$("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        }
        else {
            //$("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

/*const OnlineUsersPanel = (function() {
    // This function initializes the UI
    const initialize = function() {};

    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

		// Get the current user
        const currentUser = Authentication.getUser();

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>")
                        .append(UI.getUserDisplay(onlineUsers[username]))
                );
            }
        }
    };

    // This function adds a user in the panel
	const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    return { initialize, update, addUser, removeUser };
})();


const ChatPanel = (function() {
	// This stores the chat area
    let chatArea = null;
    // This stores the timer of typing event
    let typingTimer = null;
    // This function initializes the UI
    const initialize = function() {
		// Set up the chat area
		chatArea = $("#chat-area");

        // Submit event for the input form
        $("#chat-input-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the message content
            const content = $("#chat-input").val().trim();

            // Post it
            Socket.postMessage(content);

			// Clear the message
            $("#chat-input").val("");
        });

        // Keypress handler for input field
        $("#chat-input").on("keydown", (e) => {            
            Socket.typeMessage();
        });
 	};

    // This function updates the chatroom area
    const update = function(chatroom) {
        // Clear the online users area
        chatArea.empty();

        // Add the chat message one-by-one
        for (const message of chatroom) {
			addMessage(message);
        }
    };

    // This function adds a new message at the end of the chatroom
    const addMessage = function(message) {
		const datetime = new Date(message.datetime);
		const datetimeString = datetime.toLocaleDateString() + " " +
							   datetime.toLocaleTimeString();

		chatArea.append(
			$("<div class='chat-message-panel row'></div>")
				.append(UI.getUserDisplay(message.user))
				.append($("<div class='chat-message col'></div>")
					.append($("<div class='chat-date'>" + datetimeString + "</div>"))
					.append($("<div class='chat-content'>" + message.content + "</div>"))
				)
		);
		chatArea.scrollTop(chatArea[0].scrollHeight);
    };

    // This function adds a line of who is typing
    const addTyping = function(name) {
        clearTimeout(typingTimer);
        $("#current-typing-area").text(name + " is typing...");
        typingTimer = setTimeout(removeTyping, 3000);
    };

    // This function removes the line of someone typing after 3 seconds
    const removeTyping = function() {
        $("#current-typing-area").text("");
    }

    return { initialize, update, addMessage, addTyping};
})();
*/
const GamePanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        //const cv = $("canvas").get(0);
        //context = cv.getContext("2d");
        /*let table_image = new Image();
        table_image.onload = function(){
            context.drawImage(table_image,
                90, 90,100,50);
        };*/
        //table_image.src = "./image/table.png";
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#game-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#game-panel").hide();
    };

    // This function updates the user panel
    const update = function(own_character_id, oppo_character_id, own_name, oppo_name) {
        // generate player objects for 2 player 
        own_player = Player(own_name ,  1, own_character_id);
        oppo_player = Player(oppo_name , 2 , oppo_character_id);
        const showWinner = function(playerno) {
            $("#result").text(playerno);
            $("#gameover-container").show(); 
        }
        rest(3000);
        setTimeout(Timer.countDown, 1000);
    };
    
    const start = function(){
        Food.update();
        Cover.open();
        $(document).on("keydown", function(e){ 
            if (e.keyCode == 32){ // player 1 move using sapce bar
                own_player.move();
                clearTimeout(endtimeout);
                let resttimeout = rest(4000); // start after 4 seconds
                setTimeout(()=>{
                    Food.eaten();
                    own_player.update(Food.getFoodtype().effect);
                    Socket.update_oppo_own_move(own_player.getScore()); // update oppo about own move
                    if (own_player.getScore() >= 5){
                        clearTimeout(resttimeout); // stop the start 
                        Timer.stop();
                        showWinner(1); // show winning message of player 1
                        return false;
                    
                    }
                    Cover.close();
                    own_player.back();
                },1000); // do the above after move which use 1 second 
            }
        });
    };        
    let endtimeout = setTimeout(() =>{
        Cover.close();
        setTimeout(Food.eaten,1000);
        rest(3000);
        } ,4000	
    );

    const rest = function(time){   
        $(document).off("keydown");
        let timeout = setTimeout(start,time);
        return timeout;
    };
    // This function updates the user panel
    const update_oppo = function(oppo_score) {
        oppo_player.move();
        clearTimeout(endtimeout);
        let resttimeout = rest(4000); // start after 4 seconds
        setTimeout(()=>{
            Food.eaten();
            oppo_player.update(Food.getFoodtype().effect);	
            if (oppo_player.getScore() >= 5){
                clearTimeout(resttimeout);  // stop the start 
                Timer.stop();
                showWinner(2); // show winning message of player 2
                return false;
            }
            Cover.close();	
            oppo_player.back();					
            },1000); // do the above after move which use 1 second           
    };
    return { initialize, show, hide, update, update_oppo };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            //.append($("<span class='user-avatar'>" +
			 //       Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, WaitingOpponentPanel, CharacterSelectionPanel, GamePanel, UserPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();
