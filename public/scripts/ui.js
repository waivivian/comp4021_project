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
    let characterId = null;
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
        characterId = null;
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
                    WaitingOpponentPanel.hide();
                    CharacterSelectionPanel.hide(); 
                    //GamePanel.hide();
                    GameOverPanel.hide();
                }
            );
        });
    };

    function openInstructionBox() {
        var requirementBox = document.getElementById("instructions-box");
        requirementBox.style.display = "block";
    }

    function closeInstructionBox() {
        var requirementBox = document.getElementById("instructions-box");
        requirementBox.style.display = "none";
    }

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

    return { initialize, show, hide, update, openInstructionBox, closeInstructionBox};
})();


const GamePanel = (function() {
    /* Create the sounds */
    const sounds = {
            background: new Audio("./sound/game_background.mp3"),
            win: new Audio("./sound/win_sound.wav"),
            lose: new Audio("./sound/lose_sound.wav"),
            eat: new Audio("./sound/eating_sound.wav"),
    };
	/*
    let resttimeout = null;
    let endtimeout = null;
    let timeout = null;
	*/
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


/*

    const showWinner = function(playerno) {
        $("#result").text(playerno);
        $("#gameover-container").show(); 
    }

*/


    // This function updates the user panel
	//done
    const update = function(own_character_id, oppo_character_id, own_name, oppo_name) {
		console.log("update");
        // generate player objects for 2 player 
        sounds.background.loop = true;
        sounds.background.play()
        own_player = Player(own_name ,  1, own_character_id);
        oppo_player = Player(oppo_name , 2 , oppo_character_id);
        //Socket.generate_timeout_foodtype(); // generate food for the first round
        setTimeout(Timer.countDown, 1000); //start the timer ????
    };

    const showWinner = function(playerno) {
		console.log("showWinner");
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
		console.log("end_game");
        sounds.background.pause();
        sounds.background.currentTime = 0; // Reset the playback position to the beginning
        Cover.close();
        Timer.reset();
        Timer.stop();
        // stop the game if signout is pressed when the cover is closed due to the food being eaten
        $("#gameover-container").hide();
        $("#own-chosen-character-image").attr("src","./image/unknown.png");
        $("#enemy-chosen-character-image").attr("src","./image/unknown.png"); 
        // unset full body character image
        if (typeof own_player !== 'undefined'){  // own_player may be null sometimes when end_game is called for example when sign-out button is clicked in waiting page or character-selection page
            own_player.cancel_character_image();
        }
        if (typeof oppo_player !== 'undefined'){  // own_player may be null sometimes when end_game is called for example when sign-out button is clicked in waiting page or character-selection page
            oppo_player.cancel_character_image();
        }
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
        //Socket.generatefoodtype();//	this maybe wrong
        //Food.update();
		console.log("start");
        Cover.open();	
        $(document).on("keydown", function(e){ 
            if (e.keyCode == 32){ // player 1 move using sapce bar
				Socket.signal(own_player.getUsername());
            }
        });
    };        
	
	
	const ownScored = function(){
		console.log("ownScored");
		own_player.move();
		setTimeout(()=>{
			sounds.eat.play();
			Food.eaten();
            own_player.update(Food.getFoodtype().effect);
            //Socket.update_oppo_own_move(own_player.getScore()); // update oppo about own move
            if (own_player.getScore() >= 5){
				Timer.stop();
				showWinner(1); // show winning message of player 1
				restforever();
				///////////////////////////
				return false;   
			}
            Cover.close();
            own_player.back();
		},1000); // do the above after move which use 1 second 
	}


	
	const oppoScored = function(){
		console.log("oppoScored");
		oppo_player.move();
		setTimeout(()=>{
			sounds.eat.play();
			Food.eaten();
            oppo_player.update(Food.getFoodtype().effect);
            //Socket.update_oppo_own_move(own_player.getScore()); // update oppo about own move
            if (oppo_player.getScore() >= 5){
				Timer.stop();
				showWinner(2); // show winning message of player 1
				return false;              
			}
            Cover.close();
            oppo_player.back();
		},1000); // do the above after move which use 1 second 
	} 
	
	const restforever = function(){
		console.log("restforever");
		Socket.restforever();
	
		
	}
	
	const noOneEat = function(){
		console.log("noOneEat");
		Cover.close();
        setTimeout(Food.eaten,1000); // why need set time out here?
        //rest(3000);
		
	}

    const rest = function(time){ 
		console.log("rest");
        $(document).off("keydown");
        // start the game
        //let timeout = setTimeout(start,time);
		return null;
    };
	


    return { initialize, show, hide, update, end_game , noOneEat , rest , restforever,start , ownScored,oppoScored };
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
    const update = function(game_rank) {
        let rank_table_body = $("#rank-table-body");
                //let rank_table_body = $("#rank-table-body");

        let game_rank_result = JSON.parse(game_rank);
        console.log(game_rank_result);
        var rank = 0;
        let table_content="";
        for (var key in game_rank_result) {
            console.log(rank);
            rank++;
            table_content+="<tr><td>"+String(rank)
            +"</td><td>"+game_rank_result[key]["name"]
            +"</td><td>"+String(Math.round(game_rank_result[key]["percentage_winning"]))
            +"</td><td>"+String(Math.round(game_rank_result[key]["average_winning_time"]))
            +"</td><tr>";
        }
        rank_table_body.html(table_content);
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
