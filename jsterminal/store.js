var Store = function(unique_identifier) {

  var store = {};
  
  function supports_storage() {
    try { return 'localStorage' in window && window['localStorage'] !== null; } 
    catch (e) { return false; }
  }
  
  function unique_key(index) {
    return unique_identifier + '::' + index;
  }
  
  function setItem(key, value) {
    if(self.persistent)
      return localStorage.setItem(unique_key(key), value);
      
    return store[key] = value;
  }

  var self = {
    
    persistent: supports_storage(),
    
    set: function(key_or_object, value) {
      
      if(typeof key_or_object != 'object')
        setItem(key_or_object, value);
        
      else for(key in key_or_object) {
        if(key_or_object.hasOwnProperty(key))
          setItem(key, key_or_object[key]);
      }
    },
    
    get: function(key) {
      if(self.persistent)
        return localStorage.getItem(unique_key(key));
        
      return store[key];
    },
    
    clear: function() {
      if(self.persistent) {
        for(entry in localStorage)
          if(localStorage.hasOwnProperty(entry) && entry.split('::')[0] == unique_identifier)
             localStorage.removeItem(entry);              

      } else store = {};
    }
  
  };

  return self;
};
