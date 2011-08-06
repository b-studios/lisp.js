var InterpreterAdapter = function(callback){

  // if worker are supported - see worker.js
  if(!!window.Worker) {
    var worker = new Worker("jsconsole/worker.js");
    worker.onmessage = function(evt) {
    
      var msg = evt.data;
      callback([msg.className, msg.message.result]);   
    }
  
  // Webworkers are note supported - maybe configure Interpreter here
  } else {
  
  }
  
  
  // We only use read_all for now
  return function(string) {
      
    if(!!worker)
      worker.postMessage(string);
    
    else return Interpreter.read_all(string, function(msg) {
      callback(['response', msg.result]); 
    });      
  }

};
