importScripts('../interpreter/stringscanner.js',
              '../interpreter/parser.js', 
              '../interpreter/lisp.js',
              '../interpreter/interpreter.js');


function respond(action) {
  return function(results) {
    self.postMessage({
      action: action,
      data: results
    });
  };
}


Interpreter.configure({
  
  coop: false,
  
  console: {
    log: respond('log')
  }
});
  
// listen to messages
self.onmessage = function(evt) {
  
  try {
    // we always use self.read_all
    Interpreter.read_all(evt.data, respond('return'));                
  } catch(e) {
    respond('error')(e);
  }
}
