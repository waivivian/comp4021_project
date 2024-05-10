const Timer = (function() {
	
	const initialTime = 180;
	let timeRemaining = initialTime;
	let timer;

    const element = $("#timeRemaining");
    element.text(timeRemaining);

    const countDown = function() {
        timeRemaining = timeRemaining - 1;
		element.text(timeRemaining);
		if (timeRemaining > 0){
			timer = setTimeout(countDown, 1000);
		} 
		else{
			alert("times up"); // add game over picture later	
			GamePanel.end_game(); ////	
			WaitingOpponentPanel.show();
            UserPanel.show();
            Socket.restart_game();
			Socket.times_up();
		} 
		
    };
	
	const reset = function() {
		timeRemaining = initialTime;
		element.text(timeRemaining);
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
