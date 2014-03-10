define(function(require){

	var b = require('./b')

	return {
		init: function(){
			execOrder.log('a')
			b.init()
		}
	}

});
