const Timer = (function() {
	
	const initialTime = 180;
	let timeRemaining = initialTime;
	let timer;

    // This is the sprite object of the player created from the Sprite module.
    const element = $("#timeRemaining");
	
	

    // The sprite object is configured for the player sprite here.
    


    const countDown = function() {
        timeRemaining = timeRemaining - 1;
		element.text(timeRemaining);
		if (timeRemaining > 0) timer = setTimeout(countDown, 1000);
		else alert("times up"); // add game over picture later
		
    };
	
	const reset = function() {
		timeRemaining = 180;
    };

	const getTimeUsed = function(){
		
		
		let timeUsed = initialTime - timeRemaining;
		return timeUsed;
	
	};
	
	const stop = function(){
		
		clearTimeout(timer);	

	}


    // The methods are returned as an object here.
    return {
        countDown: countDown,
		reset: reset,
		getTimeUsed: getTimeUsed,
		stop:stop
    };
})();
