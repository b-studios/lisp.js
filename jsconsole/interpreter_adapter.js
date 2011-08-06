var InterpreterAdapter = function(callback){

  // if worker are supported - see worker.js
  if(false /*!!window.Worker*/) {
    var worker = new Worker("jsconsole/worker.js");
    worker.onmessage = function(evt) {    
      var msg = evt.data;
      callback([msg.className, msg.message]);   
    }
  
  // Webworkers are note supported - maybe configure Interpreter here
  } else {
    Interpreter.configure({
      coop: true,
      worker: false,
      timeslice: 200,
      wait: 25,
      console: {
        log:function(msg) {
           callback(['log', msg]);
        }
      }
    });
  }
  
  
  // We only use read_all for now
  return function(string) {
      
    if(!!window.Worker && !!worker)
      worker.postMessage(string);
    
    else
      Interpreter.read_all(string, function(msg) {
        callback(['response', msg]); 
      }, function(e) {
        callback(['error', e]);
      });  
  }

};
