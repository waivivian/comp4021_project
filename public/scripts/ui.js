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
        //initialize
        rest(3000);
        setTimeout(Timer.countDown, 1000); //start the timer ????
    };

    const showWinner = function(playerno) {
        $("#result").text(playerno);
        $("#gameover-container").show(); 
    }

    let endtimeout;
    const start = function(){
        Socket.generatefoodtype();
        //Food.update();
        Cover.open();	
        endtimeout = setTimeout(() =>{
            Cover.close();
            setTimeout(Food.eaten,1000); // why need set time out here?
            rest(3000);
            } ,4000	
        );
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


    const rest = function(time){   
        $(document).off("keydown");
        // start the game
        let timeout = setTimeout(start,time);
        return timeout;
    };

    // This function updates the user panel
    const update_oppo = function() {
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
