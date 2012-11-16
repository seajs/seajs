define(function(require){

	var b = require('b');

	return {
		init : function(){
			log('a');
			b.init();
		}
	}
});