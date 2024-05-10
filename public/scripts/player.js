const Player = function( userName, playerNo, character_id ) {

    const username = userName;
	const playerno = playerNo;
	let character_image_file = null;
	let character_head_image_file = null;
	// check which image this user chose
	switch (character_id){
		case "char 1":
			character_image_file = "./image/dog1t.png";
			character_head_image_file = "./image/dog1head.png";
			break;
		case "char 2":
			character_image_file = "./image/dog2t.png";
			character_head_image_file = "./image/dog2head.png";
			break;
		case "char 3":
			character_image_file = "./image/dog3t.png";
			character_head_image_file = "./image/dog3head.png";
			break;
		case "char 4":
			character_image_file = "./image/dog4t.png";
			character_head_image_file = "./image/dog4head.png";
			break;		
		case "char 5":
			character_image_file = "./image/dog5t.png";
			character_head_image_file = "./image/dog5head.png";
			break;
		case "char 6":
			character_image_file = "./image/cat1t.png";
			character_head_image_file = "./image/cat1head.png";
			break;
		case "char 7":
			character_image_file = "./image/cat2t.png";
			character_head_image_file = "./image/cat2head.png";
			break;
		case "char 8":
			character_image_file = "./image/cat3t.png";			
			character_head_image_file = "./image/cat3head.png";
			break;
		case "char 9":
			character_image_file = "./image/cat4t.png";
			character_head_image_file = "./image/cat4head.png";
			break;		
		case "char 10":
			character_image_file = "./image/cat5t.png";
			character_head_image_file = "./image/cat5head.png";
			break;                
	}

	//place character image into svg area
	const element = $("#player"+ playerno );
	element.attr("href", character_image_file);
	const element_head_image = $("#playerhead"+ playerno+"-image");
	element_head_image.attr("href", character_head_image_file);
	const element_head_name = $("#playerhead"+ playerno+"-name");
	element_head_name.text(username);
	const cancel_character_image = function(){
		character_image_file= null;
		element.attr("href", character_image_file);
		character_head_image_file= null;
		element_head_image.attr("href", character_head_image_file);		
		element_head_name.text("");
	};

	const move = function(){
		element.css("animation-name", "move"+ playerno );
	};
	
	const back = function(){
		element.css("animation-name", "back"+ playerno );
	};
	
	const getUsername = function(){
		return username;
	};
	
	
	const playerscore = gameScore(playerno);
	const playerboost = Boost(playerno);
	
    
    // The methods are returned as an object here.
    return {
		cancel_character_image: cancel_character_image,
        	move: move,
		back: back,
		update: playerscore.update,
		getScore : playerscore.getScore,
		getUsername : getUsername,
		useBoost : playerboost.use,
		isUsingBoost : playerboost.isUsing ,
		usedBoost : playerboost.used ,
		isRemainingBoost : playerboost.isRemaining ,
			
    };
};
