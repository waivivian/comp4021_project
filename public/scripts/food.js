
const Food = (function() {

    const foodtype = {
		cake:{ name:"cake" , effect:1 },
		fruit:{ name:"fruit" , effect:1 },
		battery : { name:"battery" , effect:-1 }
    };
	
	let currentFoodtype;

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
