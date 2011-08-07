var Interpreter = (function() {
  
  // The top-environment
  var __GLOBAL__;
  
  var configs = {
    
    worker: true,
    
    coop: true,
    
    // timeslice in ms
    timeslice: 100,
    
    // time to wait, until continuing
    wait: 25
  
  };
  
  /**
   * Those builtins could be placed into builtins.js, because they require
   * access to the system configs.
   */
  var system_builtins = {
  
    // @group printing and system configurations   
    
    "print": LISP.Builtin(function(list, cont) {    
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        configs.console.log(first_arg.to_s());
        return cont(LISP.nil);
      });
    }),
    
    "error": LISP.Builtin(function(list, cont) {
      throw (list.first().to_s());
    }),
    
    "inspect": LISP.Builtin(function(list, cont) {
      (!!window && window.console || configs.console).log(list, env);
      return cont(LISP.nil);
    }),
    
    "system": LISP.Builtin(function(list, cont) {
      var system_infos = [
            "Using browser's webworkers: " + (configs.worker ? "true" : "false"),
            "Using continuations for cooperative multitasking: " + (configs.coop ? "true" : "false")
      ];
      configs.console.log(system_infos.join("\n"));
      return cont(LISP.nil);
    }),
    
    "set-coop": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        configs.coop = !!first_arg.value;        
        return cont(first_arg);
      });
    })
  };
  
  
  // Evaluators
  
  function EvalLambda(lambda, call_args, cont) {

    function BindArgs(key_args, value_args, bind_env, eval_env, cont) {
      
      // empty arguments
      if(key_args.first() == LISP.nil)
        return cont(bind_env);    
        
      // Create a Continuation, which can used to bind the first evaled value to
      // the first symbol of lambda's argument list
      return LISP.Continuation(value_args.first(), eval_env, function(value) {
    
        bind_env.set(key_args.first().value, value);
                
        key_rest = key_args.rest();
        value_rest = value_args.rest();
        
        // there are still some more args to eval
        if(key_rest instanceof LISP.Pair && value_args instanceof LISP.Pair)
          return BindArgs(key_rest, value_rest, bind_env, eval_env, cont);
          
        else
          return cont(bind_env);
      });
    }


    /**
     * - args
     * - body
     * - called args
     *  
     * ich evaluiere restliste und binde die einzelnen args and die namen der symbols
     * aus args im neuen environment.
     * evaluiere danach body im neuen env
     *
     * call_args mit env evaluieren, lambda mit defined_env evaluieren  
     */
    var lambda_env = new LISP.Environment(lambda.defined_env);
            
    return BindArgs(lambda.args, call_args, lambda_env, cont.env, function(bindings) {
      return LISP.Continuation(lambda.body, bindings, cont);
    });
  }
  
  
  
  /**
   * @function .Eval
   * @return [LISP.Continuation]
   */
  function Eval(list, cont) {
   
    // if there's no environment, use GLOBAL-one
    var env = cont.env || __GLOBAL__;    
  
    if(list instanceof LISP.Pair) {
        
      // eval first item in list      
      return LISP.Continuation(list.first(), env, function(function_slot) {
      
        var rest_list = list.rest();
        
        // oh there is a lambda-definition in function_slot
        if(function_slot instanceof LISP.Lambda) 
          return EvalLambda(function_slot, rest_list, cont);
        
        // It's a continuation, so eval the first argument and call the continuation with it
        if(function_slot instanceof Function && function_slot.type == 'Continuation')
          return LISP.Continuation(rest_list.first(), env, function_slot);
        
        // seems to be a builtin function
        if(function_slot instanceof Function && function_slot.type == 'Builtin')
          return function_slot(rest_list, cont);
        
        throw "Try to exec non function " + function_slot.to_s();      
      });
      
    // it's an Symbol, that we want to resolve
    } else if(list instanceof LISP.Symbol) { 
      var resolved = env.get(list.value);

      if(resolved == undefined)
        throw "cannot resolve symbol '"+ list.value +"'";
        
      return cont(resolved);
      
    // it's quoted, let's reveal the content
    } else if(list instanceof LISP.Quoted) { 
      return cont(list.value);
      
    // it's some Atom
    } else {      
      return cont(list);
    }
  };
  
  
  // Trampolines
  
  /**
   * Simple Trampoline
   * -----------------
   * Goes on with evaluating the continuations
   * until the return_value isn't a continuation.
   */
  function Trampoline(cont) {
       
    while(typeof cont == "function" && cont.type == "Continuation")
      cont = Eval(cont.list, cont);
          
    return cont;    
  };
  
  /**
   * Special Trampoline for cooperative Multitasking
   * -----------------------------------------------
   * To prevent freezing of the Browser while calculating the
   * cooperative trampoline sleeps after each period, which is configured in 
   * configs.timeslice.
   *
   * This enables the UIThread to interact with the user, while our interpreter
   * is working.
   *
   * Another way to achieve this, is to use HTML5-WebWorkers
   */
  function CoopTrampoline(cont, callback) {
    var start = new Date();
    
    // break after 100ms
    while((new Date() - start) < configs.timeslice) {
      if(cont instanceof Function && cont.type == "Continuation") {
        cont = Eval(cont.list, cont);
      }
      else return callback(cont);
    }
    // continue after 25ms
    setTimeout(function() {
      CoopTrampoline(cont, callback);
    }, configs.wait);  
  }
  
  
  return {
    
    // just takes one command and interprets it
    'go': function(string) {    
      var cont = LISP.Continuation(Parser(string).read(), __GLOBAL__, function(results) { return LISP.Result(results); });
      return Trampoline(cont);
    },
    
    'read_all': function(string, success_callback, error_callback) {
      
      var parser = Parser(string),
          total_start = new Date(),
          timings = [];
          
      function process_next(result) {
     
        if(!!parser.eos())
          return success_callback({
            result: result.to_s(),
            total: new Date() - total_start
          });       
        
        var cont = LISP.Continuation(parser.read(), __GLOBAL__, function(results) { return LISP.Result(results); });
        
        try {
          if(!!configs.coop)
            CoopTrampoline(cont, process_next);
            
          else
            process_next(Trampoline(cont));
        } catch(e) {
          error_callback(e);
        }
        
      }
      
      // start asynchronous processing, i.e. wait for next free slice
      if(!!configs.coop)
        setTimeout(process_next, 15);
      
      else
        return process_next();
    },
    
    'get_symbols': function() {
      var symbols = [],
          bindings = __GLOBAL__.bindings;
    
      for(symbol in bindings) {
        if(bindings.hasOwnProperty(symbol))
          symbols.push(symbol);
      }
      
      return symbols.sort();
    },
    
    'configure': function(opts) {
      for(option in opts) {
        if(opts.hasOwnProperty(option))
          configs[option] = opts[option];
      }
    },
    
    'init': function(builtins) {
      
      // extend builtins with system_builtins for printing etc.
      for(builtin in system_builtins) {
        if(system_builtins.hasOwnProperty(builtin))
          builtins[builtin] = system_builtins[builtin];
      }
      
      // Set globals
      __GLOBAL__ = LISP.Environment(null).set(builtins);    
    }
  
  };
  
})();
