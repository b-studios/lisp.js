Core.extend("page", function() {

  var pages = {},
      current_page = null,
      header_dom = $("#console-header");
  
  // Make pages public
  Core.extend("pages", function() { return pages; });
  
  Core.extend("dispatcher", function() {
    
    
    function updateHeader(page) {
      header_dom.find('h1:first').html(page.title || "Untitled Page");
    }
    
    function openPage(page) {
      if(current_page != page) {
        
        updateHeader(page);
      
        if(current_page != null)  {
          current_page.hide();
          current_page.menu.hide();
        }
        page.menu.show();        
        page.show();
        
        current_page = page;
      }        
    }
    
    // register to key-events
    $(document.body).keydown(function(evt) {
            
      if(current_page != null) {
        var bubble = current_page.menu.handle(evt.keyCode);
        
        if(!bubble) 
          evt.preventDefault();          

        return bubble;
      }
    });
  
    return {
    
      open: function(page_or_pageid) {
        // if it is an id search matching page
        if(typeof page_or_pageid == "string")
          page_or_pageid = pages[page_or_pageid];
        
        openPage(page_or_pageid);
      },
      
      init: function() {
        for(pageid in pages) {      
          if(pages.hasOwnProperty(pageid)) {
            header_dom.append(pages[pageid].menu.hide());
            pages[pageid].init();
          }
        }
      }
    };  
  });
  
  var Menu = function() {
  
    var key_bindings = [],
        menu = $('<menu/>');
  
    var keyCodes = {
      'ESC': 27,
      'RETURN': 13,
      
      'UP': 38,
      'DOWN': 40,
    
      '1': 49,
      '2': 50,
      '3': 51,
      '4': 52,
      '5': 53,
      '6': 54,
      '7': 55,
      '8': 56,
      '9': 57,
      '0': 58,      
    
      'F1': 112,
      'F2': 113,
      'F3': 114,
      'F4': 115,      
      'F5': 116,
      'F6': 117,
      'F7': 118,
      'F8': 119,      
      'F9': 120,
      'F10': 121,
      'F11': 122,
      'F12': 123     
    };
    
    function addMenuItem(command, keyname) {
      
      var button = $("<button>", {
        html: command.title + " ("+keyname+")",
        click: function() {
            command.do();
        }
      });
      
      menu.append(button);      
    }
    
    // visible=true should trigger rendering in top-menu
    menu.addItem = function(command, keyname, visible) {
      if(visible)
        addMenuItem(command, keyname);
        
      var keyCode = keyCodes[keyname];        
      if(keyCode == undefined)
        throw "Keycode for '"+keyname+"' not found";
      
      key_bindings[keyCode] = command; 
    };
    
    menu.handle = function(keyCode) {
      if(key_bindings[keyCode] != undefined) {
        key_bindings[keyCode].do();
        return false;
      }
      return true;
    };
    
    return menu;    
  };
  
  return function(page_id, constructor) {
    if(pages[page_id] != undefined)
      throw "Page "+page_id+" already defined.";
      
    var page_menu = Menu();
    pages[page_id] = constructor(page_menu);
    pages[page_id]["menu"] = page_menu;
    pages[page_id].id = page_id;
  };
  
});
