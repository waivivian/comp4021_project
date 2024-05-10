const Cover = (function() {

    const element = $("#cover");
	
    const open = function() {

        element.css("animation-name", "open");
		
    };
	
	const close = function() {
        return new Promise((resolve, reject) => {
            element.css("animation-name", "close");
            setTimeout(resolve,1000);
          });
    };

    // The methods are returned as an object here.
    return {
        open: open,
	close: close
    };
})();
