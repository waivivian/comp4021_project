// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Food = (function() {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const foodtype = {
		cake:{ name:"cake" , effect:1 },
		fruit:{ name:"fruit" , effect:1 },
		battery : { name:"battery" , effect:-1 }
    };
	
	let currentFoodtype;

    // This is the sprite object of the player created from the Sprite module.
    const element = $("#food");

  
	
	
	const setFoodtype = function(generatedfoodtype){
				
		currentFoodtype = generatedfoodtype;

	}
	
	const getFoodtype = function(){
				
		return currentFoodtype;

	}
	
	
    
	const eaten = function() {
        element.hide();
	};
		
    const update = function(foodtype) {
		/* move to server (chat_server.js) so as to have the food type broadcast to both player and they see the same food 
		const foodtypeKey = Object.keys(foodtype)
		const random = Math.floor(Math.random() * foodtypeKey.length);
		const randomFoodtypeKey = foodtypeKey[random];
		const randomFoodtype = foodtype[randomFoodtypeKey];
		*/
		setFoodtype(foodtype);
		const path = "image/"+currentFoodtype.name+".svg";
		element.attr("href", path );
		element.show();
    };

    // The methods are returned as an object here.
    return {
        update: update,
		eaten: eaten,
		setFoodtype : setFoodtype,
		getFoodtype : getFoodtype
    };
})();
