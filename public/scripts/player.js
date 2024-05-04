// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player = function( userName, playerNo, character_id ) {

    const username = userName;
	const playerno = playerNo;
	let character_image_file = null;
	// check which image this user chose
	switch (character_id){
		case "char 1":
			character_image_file = "./image/dog1t.png";
			break;
		case "char 2":
			character_image_file = "./image/dog1t.png";
			break;
		case "char 3":
			character_image_file = "./image/dog2.png";
			break;
		case "char 4":
			character_image_file = "./image/dog2.png";
			break;
		case "char 5":
			character_image_file = "./image/cat1t.png";
			break;
		case "char 6":
			character_image_file = "./image/cat1t.png";
			break;
		case "char 7":
			character_image_file = "./image/cat2.png";
			break;
		case "char 8":
			character_image_file = "./image/cat2.png";
			break;                
	}

	//place character image into svg area
	const element = $("#player"+ playerno );
	element.attr("href", character_image_file);
	
	
	const move = function(){
		element.css("animation-name", "move"+ playerno );
	};
	
	const back = function(){
		element.css("animation-name", "back"+ playerno );
	};
	
	/*
	$(function (){
		element.on("animationend", function() {

				// You need to stop the animation here
				element.css("animation-name", "none");
			
			});
			
	});
	
	
	const stop = function(){
		element.css("animation-play-state", "paused");
	};
	*/
	
	const playerscore = gameScore(playerno);
	
    
    // The methods are returned as an object here.
    return {
        move: move,
		back: back,
		update: playerscore.update,
		getScore : playerscore.getScore
		
    };
};
