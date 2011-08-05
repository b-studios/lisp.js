Core.page("interpreter", function(menu){

  var welcome_printed = false;

  var dom = $("#page-interpreter");
 
  if(!!window.Worker) {
    var worker = new Worker("interpreter/interpreter.js");
    worker.onmessage = function(evt) {
    
      var msg = evt.data;
      
      switch(msg.action) {
        case 'return':
          console.output(msg.data.result + " (in "+msg.data.total+"ms)");
          break;
        
        case 'error':
          console.error(msg.data);
          break;
          
        case 'log':        
        default:
          console.log(msg.data);  
          break;      
      }      
    
    }
  }
  
  var console = Console(dom, function(msg) {
 
    if(!!worker) {
      worker.postMessage(msg);
    
    } else {
      return Interpreter.read_all(command, function(result_set) {
        console.output(result_set.result);
      });
    } 
  });

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
