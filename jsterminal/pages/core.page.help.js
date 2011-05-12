Core.page("help", function(menu){

  var dom = $("#page-help");

  function initialize() {
    dom.hide();
    
    // add keybindings and add items to menubar
    menu.addItem(Core.command('< Back', Core.pages.interpreter), "ESC", true);
    
  }

  return {
    init: initialize,    
    show: function() {       
      dom.show();
    },
    hide: function() {
      dom.hide();
    },
    title: "Help"
  };
});
