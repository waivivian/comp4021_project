const Cover = (function() {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    

    // This is the sprite object of the player created from the Sprite module.
    const element = $("#cover");
	
	

    // The sprite object is configured for the player sprite here.
    


    const open = function() {

        element.css("animation-name", "open");
		
    };
	
	const close = function() {

        element.css("animation-name", "close");
		
    };

    // The methods are returned as an object here.
    return {
        open: open,
		close: close
    };
})();
