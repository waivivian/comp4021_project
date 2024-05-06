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
    const sounds = {
        waiting: new Audio("./sound/waiting.mp3"),        
    };
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#waiting-opponent").hide();
        // Click event for the start game button
    };

    // This function shows the form with the user
    const show = function() {
        $("#waiting-opponent").show();
        sounds.waiting.loop = true;
        sounds.waiting.play();
    };

    // This function hides the form
    const hide = function() {
        $("#waiting-opponent").hide();
        sounds.waiting.pause();

    };

    return { initialize, show, hide };
})();


const CharacterSelectionPanel = (function() {
    const sounds = {
        background: new Audio("./sound/character_select_background.mp3"),        
        select: new Audio("./sound/select.mp3"),        
        versus: new Audio("./sound/versus.mp3")
    };
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
                sounds.select.play();
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
            sounds.versus.play();
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
        sounds.background.loop = true;
        sounds.background.play();
    };

    // This function hides the form
    const hide = function() {
        $("#character-selection").hide();
        sounds.background.pause();
        sounds.background.currentTime = 0; // Reset the playback position to the beginning

        
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
                    //WaitingOpponentPanel.hide();
                    //CharacterSelectionPanel.hide(); 
                    //GamePanel.hide();
                    //GameOverPanel.hide();
                    
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
    /* Create the sounds */
    const sounds = {
            background: new Audio("./sound/game_background.mp3"),
            win: new Audio("./sound/win_sound.wav"),
            lose: new Audio("./sound/lose_sound.wav"),
            eat: new Audio("./sound/eating_sound.wav"),
    };
    let resttimeout = null;
    let endtimeout = null;
    let timeout = null;
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
    const show = function() {
        $("#game-panel").show();

    };

    // This function hides the form
    const hide = function() {
        $("#game-panel").hide();
    };

    // This function updates the user panel
    const update = function(own_character_id, oppo_character_id, own_name, oppo_name) {
        // generate player objects for 2 player 
        sounds.background.loop = true;
        sounds.background.play()
        own_player = Player(own_name ,  1, own_character_id);
        oppo_player = Player(oppo_name , 2 , oppo_character_id);
        Socket.generate_timeout_foodtype(); // generate food for the first round
        //initialize
        rest(3000);
        setTimeout(Timer.countDown, 1000); //start the timer ????
    };

    const showWinner = function(playerno) {
        //$("#result").text(playerno);
        sounds.background.pause();
        sounds.background.currentTime = 0; // Reset the playback position to the beginning
        $(document).off("keydown");
        if (playerno === 1){
            Socket.cal_rank(Timer.getTimeUsed());
            $("#gameover").html("You Win");
            sounds.win.play();
            // when the song finished show the game over page
            sounds.win.addEventListener('ended', function() {
                // ensure players are at origianl position
                own_player.back();
                GameOverPanel.show();
                end_game(); // cannot be put in end_game() as it will be called by sign_ou

            });
        }
        else{
            $("#gameover").html("You Lose");
            sounds.lose.play();
            // when the song finished show the game over page
            sounds.lose.addEventListener('ended', function() {
                // ensure players are at origianl position
                oppo_player.back();
                GameOverPanel.show(); // cannot be put in end_game() as it will be called by sign_out
                end_game();
            });        
        }
        $("#gameover-container").show(); 
    }
    const end_game= function(){
        sounds.background.pause();
        sounds.background.currentTime = 0; // Reset the playback position to the beginning
        Cover.close();
        Timer.reset();
        Timer.stop();
        // stop the game if signout is pressed when the cover is closed due to the food being eaten
        if (resttimeout){
            clearTimeout(resttimeout); // stop the start 
        }
        // stop the game if signout is pressed when the cover is closed due to timeout
        if (endtimeout){
            clearTimeout(endtimeout); // stop the start 
        }
        // stop the game if signout is pressed when the cover is opened
        if (timeout){
            clearTimeout(timeout); // stop the start 
        }
        $("#gameover-container").hide();
        $("#own-chosen-character-image").attr("src","./image/unknown.png");
        $("#enemy-chosen-character-image").attr("src","./image/unknown.png"); 
        // unset full body character image
        own_player.cancel_character_image();
        oppo_player.cancel_character_image();
        // Change all heart to gray
        // Perform jQuery operation on all elements with a heart class
        $('.heart').each(function() {
            // Change all fill attribute of the first path element
            const firstPath = $(this).find('path:eq(0)');
            firstPath.attr("fill","#CCCCCC");
            // Change the fill attribute of the second path element
            const secondPath = $(this).find('path:eq(1)');
            secondPath.attr("fill","#808080");
            // Change the fill attribute of the third path element
            const thirdPath = $(this).find('path:eq(2)');
            thirdPath.attr("fill","#FFFFFF");
        });
    }
    const start = function(){
        //Food.update();
        console.log("cover open");
        Cover.open();	
        endtimeout = setTimeout(() =>{ // if after certain time the food is not eaten by any player
            Cover.close().then(() => {
                // the new food should be generated after the animaion thatcover is closed
                console.log("timeout then generated");
                Food.eaten();
                Socket.generate_timeout_foodtype();
            });                    
            //setTimeout(Food.eaten,1000); // why need set time out here? because cover close require 1 second
             // why need set time out here? because cover close require 1 second
            rest(3000);
            } ,4000	
        );
        $(document).on("keydown", function(e){ 
            if (e.keyCode == 32){ // player 1 move using sapce bar
                own_player.move();
                console.log("move",$("#player1").attr("x"));

                Socket.update_oppo_own_move(); // update oppo about own move
                clearTimeout(endtimeout);
                resttimeout = rest(4000); // start after 4 seconds
                setTimeout(()=>{
                    sounds.eat.play();
                    Food.eaten(); //hide the food when the player reach the food and the player movement require one second
                    console.log("eaten",Food.getFoodtype());
                    own_player.update(Food.getFoodtype().effect);
                    if (own_player.getScore() >= 5){
                        clearTimeout(resttimeout); // stop the start 
                        Timer.stop();
                        showWinner(1); // show winning message of player 1
                        return false;
                    }
                    //Cover.close(() => {
                    //    // the new food should be generated after the animaion thatcover is closed
                    //    console.log("eaten then generated");
                    //    Socket.generatefoodtype();
                    //}); 
                    Cover.close().then(() => {
                        // the new food should be generated after the animaion thatcover is closed
                        console.log("eaten then generated");
                        Socket.generatefoodtype();
                    });                        
                    own_player.back();
                },1000); // do the above after move which use 1 second                     

            }
        });
    };        


    const rest = function(time){   
        $(document).off("keydown");
        // start the game
        timeout = setTimeout(start,time);
        return timeout;
    };


    // This function updates the user panel
    const update_oppo = function() {
        oppo_player.move();
        clearTimeout(endtimeout);
        resttimeout = rest(4000); // start after 4 seconds
        setTimeout(()=>{
            sounds.eat.play();
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
    return { initialize, show, hide, update, update_oppo, end_game };
})();


const GameOverPanel = (function() {
    const sounds = {
        //background: new Audio("./sound/character_select_background.mp3"),        
        //select: new Audio("./sound/select.mp3"),        
        //versus: new Audio("./sound/versus.mp3")
    };
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-over-page").hide();
        // Convert HTMLCollection to an array-like object
        // Click event for the restart game button
        $("#restart-button").on("click", () => {
            hide();
            WaitingOpponentPanel.show();
            UserPanel.show();
            Socket.restart_game();
        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#game-over-page").show();

    };

    // This function hides the form
    const hide = function() {
        $("#game-over-page").hide();
        //sounds.background.pause();
    };

    // This function updates the user panel
    const update = function(selected_image_src) {
        $("#enemy-chosen-character-image").attr("src",selected_image_src);
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
    const components = [SignInForm, WaitingOpponentPanel, CharacterSelectionPanel, GamePanel, GameOverPanel, UserPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();
