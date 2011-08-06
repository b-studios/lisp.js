importScripts('../interpreter/stringscanner.js',
              '../interpreter/parser.js', 
              '../interpreter/lisp.js',
              '../interpreter/interpreter.js');


function respond(log_class) {
  return function(results) {
    self.postMessage({
      className: log_class,
      message: results
    });
  };
}


Interpreter.configure({
  
  coop: false,
  
  console: {
    log: respond('log'),
  }
});
  
// listen to messages
self.onmessage = function(evt) {
  
  try {
    // we always use self.read_all
    Interpreter.read_all(evt.data, respond('response'), respond('error'));
  
  // unexpected errors
  } catch(e) {
    respond('error')(e);
  }
}
