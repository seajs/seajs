define(function(require){
	
	var a = require('./a')

	return {
		init : function(){
			execOrder.log('c')
		}
	}

});
