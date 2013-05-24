define(function(require){
	
	var c = require('./c')

	return {
		init : function(){
      execOrder.log('b')
      c.init()
		}
	}

});
