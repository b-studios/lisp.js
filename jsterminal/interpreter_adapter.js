var InterpreterAdapter = function(console){


  function composeOutput(data) {
    return data.result + " (in "+data.total+"ms)"
  }

  // if worker are supported
  if(!!window.Worker) {
    var worker = new Worker("jsterminal/worker.js");
    worker.onmessage = function(evt) {
    
      var msg = evt.data;
      
      switch(msg.action) {
        case 'return':
          console.output(composeOutput(msg.data));
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
  
  
  return {
  
    'do': function(string) {
      
      if(!!worker)
        worker.postMessage({
          action: 'do',
          data: string
        });
      
      else return Interpreter.do(string);
      
    },
    
    'read_all': function(string) {
      
      if(!!worker)
        worker.postMessage({
          action: 'read_all',
          data: string
        });
      
      else return Interpreter.read_all(string, function(result_set) {
          console.output(composeOutput(result_set));
        });      
    }
  }

};
