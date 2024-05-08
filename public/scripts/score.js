// This defines the GameScore module
const gameScore = function(playerno) {

    // The current score
    let score = 0;

    // The element holding the score

    // The update display function
    const updateDisplay = function(Score) {
		/*
        if (increase){
            // turn a heart to red
            // Change the fill attribute of the first path element
            $("#heart"+String(playerno)+String(score)+" path").eq(0).attr("fill","#F44336");
            // Change the fill attribute of the second path element
            $("#heart"+String(playerno)+String(score)+" path").eq(1).attr("fill","#C62828");
            // Change the fill attribute of the third path element
            $("#heart"+String(playerno)+String(score)+" path").eq(2).attr("fill","#FF847A");
        }
        else{
            // turn a heart to gray
            // Change the fill attribute of the first path element
            $("#heart"+String(playerno)+String(score+1)+" path").eq(0).attr("fill","#CCCCCC");
            // Change the fill attribute of the second path element
            $("#heart"+String(playerno)+String(score+1)+" path").eq(1).attr("fill","#808080");
            // Change the fill attribute of the third path element
            $("#heart"+String(playerno)+String(score+1)+" path").eq(2).attr("fill","#FFFFFF");
        }
    };
		*/
		
		for (let i = 1 ;i <=5;i++){
			
			  // Change the fill attribute of the first path element
            $("#heart"+String(playerno)+String(i)+" path").eq(0).attr("fill","#CCCCCC");
            // Change the fill attribute of the second path element
            $("#heart"+String(playerno)+String(i)+" path").eq(1).attr("fill","#808080");
            // Change the fill attribute of the third path element
            $("#heart"+String(playerno)+String(i)+" path").eq(2).attr("fill","#FFFFFF");
			

		}
		
		for (let i =1 ;i <=Score;i++){
			
			  // Change the fill attribute of the first path element
			$("#heart"+String(playerno)+String(i)+" path").eq(0).attr("fill","#F44336");
            // Change the fill attribute of the second path element
            $("#heart"+String(playerno)+String(i)+" path").eq(1).attr("fill","#C62828");
            // Change the fill attribute of the third path element
            $("#heart"+String(playerno)+String(i)+" path").eq(2).attr("fill","#FF847A");
			

		}
		
	};
		
		
		
		
		
		
		
    // The increase score function
    const update = function(effect) {
        score = score + effect;
        if (score < 0){
            score = 0;
        }
		updateDisplay(score);
		/*
        else{
            if (effect > 0){
                updateDisplay(true);
            }
            else{
                updateDisplay(false);
            }
        }
		*/
		
		
		
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
