/**
 * TODO: 
 * - Dependency Check der Extensions
 * - Extensionloader
 *
 * Man könnte überlegen den Extensions ein Sandbox-Element zu geben, welches diese auch erweitern
 * können. z.B. könnte damit die Hooks-extension die Sandbox erweitern, ohne dass diese von modulen
 * erreichbar wären.
 *
 *
 * Extensions als Packages: Core.extend('foo.bar') => Core.foo.bar mit foo = foo|| {}
 */
var Core = Core || (function(){
 
  var _extensions = {};

  var core = {

    // register new core-extension
    extend: function(id, constructor) {
      
      // Already defined
      if(!!core[id]) {
        core.logger.log("Info: Overwriting '"+id+"'. It is already defined.");
      }
      
      var ext = constructor();
      if(!!ext) {
        core[id] = ext;
        _extensions[id] = ext;
      } else {
        core.logger.log("Info: Constructor of '"+id+"' did not return a valid value.");
      }
    }, 
    
    extensions: function() {
      return _extensions;
    },    
    
    // minimal logging functionality
    logger: {
      log: function(msg) {
        if(!!window.console) {
          window.console.log(msg);
        }
      }
    }
  };
  
  return core;      
})();