var InterpreterAdapter = function(callback){

  var worker_wanted = true;

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
        callback(['error', e]);
      });  
  };
  
  interpreter.worker = function(on_off) {
    worker_wanted = !!on_off;
  }
  
  return interpreter;
};
