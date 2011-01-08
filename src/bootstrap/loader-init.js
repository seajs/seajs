
/**
 * @fileoverview Init Module Loader.
 * @author lifesinger@gmail.com (Frank Wang)
 */

(function(loader) {

  var main = loader.main;

  if (main) {
    loader.importingModule = main;
    loader.importModule(main.uri);
  }

})(S.ModuleLoader);
