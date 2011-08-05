var Console = function(selector, action) {

  var dom = $(selector),
      output = dom.find("#console-out"),
      input = dom.find("#input"),
      command_count = 1,
      settings = Core.settings,
      history = new CommandHistory(function(command) {
        input.val(command);      
      });
  
  var html = {  
  
    input_element: function(command) {    
          
      var user_input = $('<kbd>', {
        html: command,
        id: "command-"+command_count
      });
    
      var prompt = $('<samp>', {
        html: self.line_start.replace(/#line/, zero_padding(command_count,3))
      });   
      
      output.append(prompt).append(user_input);
      
      return user_input;
    },
    
    output_element: function(return_val) {
      var el = $('<output>', {
        'html': return_val   
      });
      
      // at this point jquery is broken:
      el[0].setAttribute("for", "command-"+command_count);
      
      output.append(el);
      output.scrollTop(9999999)
      return el;     
    }  
  };
  
  var command_fired = function(command) {
    var input_el = html.input_element(command);
    
    // if internal console is turned on    
    if(!settings.get('browser_console')) {
      try {
        action(command); // self.output(...);        
      } catch (e) {
        self.error(e);
      }
    
    } else console.log(action(command))
    
    
    history.add(command);
    input.val("");
    command_count++;
  };  
  
  // bind events to textarea
  input.keydown(function(evt) {
  
    if(!settings.get('editor_mode')) {
  
      if (evt.keyCode == 40) {      
        evt.preventDefault();
        history.down();
      
      // key up
      } else if (evt.keyCode == 38) {      
        evt.preventDefault();
        history.up();
      
      } else if (evt.keyCode == 13) {
        evt.preventDefault();
        command_fired(input.val());
      } 
    }
  });
  
  $(document.body).bind('console::clear_history', function() {
    history.clear();  
  });
  
  
  // helpers function
  var zero_padding = function(number, amount) {
    var string = String(number);     
    for(amount = amount - string.length;amount>0;amount--)
      string = "0"+string;
    return string;
  };
  
  // interface and configs
  var self = {
    
    line_start: "lisp:#line> ",
    
    log: function(msg) {
      html.output_element(msg);
    },
    
    error: function(msg) {
      html.output_element("<span class='error'><strong>ERROR:</strong> "+msg+"</span>");
    },
    
    output: function(msg) {
      html.output_element("=> "+msg);
    },
    
    process: function(string) {
      if(string == undefined)
        string = input.val();
        
      command_fired(string);
    }    
    
  };  
  
  return self;
};
