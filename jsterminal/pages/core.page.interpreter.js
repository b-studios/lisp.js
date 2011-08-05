Core.page("interpreter", function(menu){

  var welcome_printed = false;

  var dom = $("#page-interpreter");

  var console = Console(dom, function(command) {
    return Interpreter.read_all(command);
  });

  function initialize() {
    
    dom.hide();
    
    Interpreter.read_eval_print('(define welcome_message "Welcome to this Lisp-Interpreter. <br/>Just type some Lisp-Code below or get informed about the builtin functions (Simply press F1)<br/><br/>Why don\'t you start with something like <code>(+ 40 2)</code>?")');
    
    // set console for printing out of lisp
    Interpreter.configure({
      console: console
    });
    
    
    
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
          console.process("(print welcome_message)");
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
