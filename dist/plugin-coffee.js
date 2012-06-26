define("seajs/plugin-coffee",["./plugin-base","coffee"],function(a){var b=a("./plugin-base"),c=a("coffee");b.add({name:"coffee",ext:[".coffee"],fetch:function(a,b){c.load(a,b)}})});
