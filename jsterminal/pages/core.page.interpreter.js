Core.page("interpreter", function(menu){

  var welcome_printed = false;

  var dom = $("#page-interpreter");
 
  var interpreter = InterpreterAdapter(console);  

  var console = Console(dom, interpreter.read_all);

  function initialize() {
    
    dom.hide();     
    
    commands = {      
      help: Core.command('Help', Core.pages.help),
      settings: Core.command('Settings', Core.pages.settings),
      execute: Core.command('Execute', function() {
        console.process();
      })
    }
    
    // add keybindings and add items to menubar
    menu.addItem(commands.help, "F1", true);
    menu.addItem(commands.settings, "F2", true);
    menu.addItem(commands.execute, "F12", true);
  }

  return {
    init: initialize,    
    show: function() {
      if(!welcome_printed) {
        setTimeout(function() {
          console.process('(print "Welcome to this LISP Interpreter!")');
        }, 400);
      }
    
      // check each time, which mode is activated and set class
      if(Core.settings.get('editor_mode'))
        dom.addClass('editor');
      else
        dom.removeClass('editor');      
      dom.show();
      $('#input').select();
      $('#page-interpreter').scrollTop(999999);
    },
    hide: function() {
      dom.hide();
    },
    title: "Lisp Interpreter"
  };
});
