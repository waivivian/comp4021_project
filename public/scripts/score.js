// This defines the GameScore module
const gameScore = function(playerno) {

    // The current score
    let score = 0;

    // The element holding the score
    const element = $("#score"+playerno);
	

    // The update display function
    const updateDisplay = function() {
        element.text(score);
    };

    // The increase score function
    const update = function(effect) {
        score = score + effect;
        if (score < 0)
            score = 0;
		updateDisplay();
    };
	
	const getScore = function(){
	
		return score;

	};

    

    // Return (expose) the required functions
    return {
        update: update,
		getScore : getScore
    };
};
