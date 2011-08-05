var Thread = function(opts) {

  opts.timeslice = opts.timeslice || 100;
  opts.pause = opts.pause || 25;
  opts.callback = opts.callback || function(return_val) {
  
  };
  // Webworker support
  if(!!window.Worker) {
  
  
  
  } 
  
  // Do timeslicing
  function calculate(action) {
  
    var start = Date();
    while((Date() - start) < opts.timeslice) {
      if(action instanceof Function)
        action = action();
      
      else return opts.callback(action);
    }
    
    // continue after some time
    setTimeout(function() {
      calculate(action);
    }, opts.pause);    
  }
  

};
