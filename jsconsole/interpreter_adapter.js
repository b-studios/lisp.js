var InterpreterAdapter = function(callback){

  var worker_wanted = true,
      debug = false;

  // if worker are supported - see worker.js
  if(!!window.Worker) {
    var worker = new Worker("jsconsole/worker.js");
    worker.onmessage = function(evt) {    
      var msg = evt.data;
      callback([msg.className, msg.message]);   
    }
  
  // Webworkers are note supported - maybe configure Interpreter here
  }
  // configure the default interpreter (not worker) anyways
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
  
  
  // We only use read_all for now
  var interpreter = function(string) {
      
    if(!!window.Worker && !!worker && !!worker_wanted)
      worker.postMessage(string);
    
    else
      Interpreter.read_all(string, function(msg) {
        callback(['response', msg.result + "<time>"+msg.total+" ms</time>"]);
      }, function(e) {
        if(!debug)
          callback(['error', e]);
        else
          window.console.error(e);
      });  
  };
  
  interpreter.worker = function(on_off) {
    worker_wanted = !!on_off;
  };
  
  interpreter.debug = function() {
    worker_wanted = false;
    debug = true;
    Interpreter.configure({
      coop: false,
      console: window.console
    });
  };
  
  return interpreter;
};
