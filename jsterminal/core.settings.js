Core.extend('settings', function() {

  var store = Store("___SETTINGS___");
  
  var Bool = function(string) {
    return string == "true";
  }
  
  var self = {
    
    entries: {
      editor_mode: { format: Bool, default: false },
      browser_console: { format: Bool, default: false },
      auto_env: { format: Bool, default: true },
      environment: { format: String, default: "" }
    },
    
    applyDefaults: function(overwrite) {
      for(key in self.entries) {
          if(self.entries.hasOwnProperty(key))
            overwrite? store.set(key, self.entries[key].default) : 
                       store.get(key) != undefined || store.set(key, self.entries[key].default);  
      }
    },
    
    get: function(key) {
      if(self.entries[key] != undefined)
        return self.entries[key].format(store.get(key));
    },
    
    set: function(key, value) {
      if(self.entries[key] != undefined)
        store.set(key, value);
    }
  
  };
  
  return self;
});
