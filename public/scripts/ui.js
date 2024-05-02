const SignInForm = (function() {
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
    let context = null;
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        const cv = $("canvas").get(0);
        context = cv.getContext("2d");
        console.log("context",context);

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
    const update = function(own_character_id, oppo_character_id) {
        // insert own character image into canvas area
        let own_character_image = new Image();
        own_character_image.onload = function(){
            context.drawImage(own_character_image,
                50, 80);
        };
        switch (own_character_id){
            case "char 1":
                own_character_image.src = "./image/dog1.png";
                break;
            case "char 2":
                own_character_image.src = "./image/dog1.png";
                break;
            case "char 3":
                own_character_image.src = "./image/dog2.png";
                break;
            case "char 4":
                own_character_image.src = "./image/dog2.png";
                break;
            case "char 5":
                own_character_image.src = "./image/cat1.png";
                break;
            case "char 6":
                own_character_image.src = "./image/cat1.png";
                break;
            case "char 7":
                own_character_image.src = "./image/cat2.png";
                break;
            case "char 8":
                own_character_image.src = "./image/cat2.png";
                break;                
        }
        // insert opponent character image into canvas area
        let oppo_character_image = new Image();
        oppo_character_image.onload = function(){
                context.drawImage(oppo_character_image,
                200, 80);
        };
        switch (oppo_character_id){
            case "char 1":
                oppo_character_image.src = "./image/dog1.png";
                break;
            case "char 2":
                oppo_character_image.src = "./image/dog1.png";
                break;
            case "char 3":
                oppo_character_image.src = "./image/dog2.png";
                break;
            case "char 4":
                oppo_character_image.src = "./image/dog2.png";
                break;
            case "char 5":
                oppo_character_image.src = "./image/cat1.png";
                break;
            case "char 6":
                oppo_character_image.src = "./image/cat1.png";
                break;
            case "char 7":
                oppo_character_image.src = "./image/cat2.png";
                break;
            case "char 8":
                oppo_character_image.src = "./image/cat2.png";
                break;                
        }
    };

    return { initialize, show, hide, update };
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
