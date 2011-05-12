var CommandHistory = function(setValue) {

  /**
   * @extends Store
   */
  var storage = (function() {

    var store = Store("CommandHistory");
    
    return {
      size: function(newValue) {
        if(newValue == undefined)
          return Number(store.get("length") || 0);
          
        store.set("length", newValue);
      },      
      get: store.get,      
      set: store.set,
      clear: store.clear
    };
  })();      

  var cursor = storage.size();
     
  function up() {  
    if(cursor <= 0)
      return;
    
    setValue(storage.get(cursor - 1));    
    cursor--    
  };
  
  function down() {      
    if(cursor < storage.size() - 1) {      
      setValue(storage.get(cursor + 1));
      cursor++;
      
    } else {
      setValue("");
      cursor = storage.size();
    }
  };
  
  function add(command) {  
    storage.set(storage.size(), command);
    storage.size(storage.size() + 1);
    cursor = storage.size()-1;
  };
  
  return {
    up: up,
    down: down,
    add: add,
    clear: storage.clear
  }
};
