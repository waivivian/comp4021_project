const Boost = function( playerno) {

    const element = $("#x2boost"+playerno);
	element.css("fill","white");
	let remaining = true;
	let using  = false

	const use = function(){
		element.css("fill", "blue" );
		using = true
		
	};
	const isUsing = function(){
		
		return using;

	}
	
	
	const used = function(){
		
		element.css("fill", "grey" );
		remaining = false;
		using = false;
		
	};
	
	const isRemaining = function(){
		
		return remaining;

	}
	

    
    // The methods are returned as an object here.
    return {use,isUsing,used,isRemaining};
};
