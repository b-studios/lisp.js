/**
 * @object Interpreter
 * @requires LISP all datatypes for this interpreter
 * @requires Parser the Lisp-Parser
 *
 * @todo Macros, Tests, Environment and Continuations as first class Objects
 * @note falls es nochmals Probleme geben sollte mit TCO, könnten alle `return`
 *   Aufrufe, die bisher wie folgt realisiert sind:
 *
 *     return foo;
 *     => 
 *     cont(foo);
 *
 * umgeschrieben werden zu:
 *     
 *     LISP.Continuation(foo, cont.env, cont);
 *
 * zu beachten ist, dass dabei foo ein zweites mal evaluiert wird. Eventuell
 * müsste man das durch `new LISP.Quote(foo)` verhindern
 *
 * - display 
 * - workerthread
 
 
 Verwendet die continuations für timeslicing, wenn workerthread nicht supported
 
 */
var Interpreter = (function() {

  var configs = {
    // console for outputting builtin print-function  
    console: window.console,
    
    // Trampoline in cooperative mode (timeslicing)
    coop: false,
      
    // timeslice in ms
    timeslice: 100,
    
    // time to wait, until continuing
    wait: 25
  
  };
    
  var BuiltIns = {
    
    "assert": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(value) {
        if(value == LISP.true)
          return cont(LISP.nil);
        else
          throw "Assertion failure: " + list.second().to_s();
      });    
    }),
    
    // bekommt zwei Elemente und muss beide evaluieren
    "cons": LISP.Builtin(function(list, cont) {     
      
      // Evaluate first argument
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        // Evaluate second argument
        return LISP.Continuation(list.second(), cont.env, function(second_arg) {
          return cont(new LISP.Pair(first_arg, second_arg));
        });
      }); 
    }),
    
    "car": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        return cont(first_arg.first());
      });
    }),
    
    "cdr": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        return cont(first_arg.rest());
      });
    }),    
    
    
    
    // just do nothing for this eval
    "quote": LISP.Builtin(function(list, cont) {
      return cont(list.first());
    }),
    
    // returns the current bindings
    "get-bindings": LISP.Builtin(function(list, cont) {
      return cont(cont.env);
    }),
    
    // Double evaluate
    "eval": LISP.Builtin(function(list, cont) {
      
      var evaluate = function(env) {
        return LISP.Continuation(list.first(), env, function(first_pass) {
          return LISP.Continuation(first_pass, env, function(second_pass) {
            return cont(second_pass);
          });        
        });
     }
      
      // evaluate second argument - it's the binding
      if(list.second() !== LISP.nil)
        return LISP.Continuation(list.second(), cont.env, evaluate);
        
      else return evaluate(cont.env);      
    }),   
    
    
    
    "print": LISP.Builtin(function(list, cont) {    
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        configs.console.log(first_arg.to_s());
        return cont(LISP.nil);
      });
    }),
    
    "error": LISP.Builtin(function(list, cont) {
      throw (list.to_s());
    }),
    
    "inspect": LISP.Builtin(function(list, cont) {
      console.log(list, env);
      return cont(LISP.nil);
    }),
    
    // Resets the Global environment
    "reset": LISP.Builtin(function(list, cont) {
      __GLOBAL__ = LISP.Environment(null).set(BuiltIns);
      return cont(LISP.nil);
    }),
    
    
    
    "+": LISP.Builtin(function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a+b; });
    }),
    
    "-": LISP.Builtin(function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a-b; });
    }),
    
    "*": LISP.Builtin(function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a*b; });
    }),
    
    "/": LISP.Builtin(function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a/b; });
    }),
    
    "%": LISP.Builtin(function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a%b; });
    }),
    
    // (if cond if-part else-part)
    "if": LISP.Builtin(function(list, cont) {
      
      return LISP.Continuation(list.first(), cont.env, function(condition) {
               
        // if-part
        if(!!condition.value) 
          return LISP.Continuation(list.second(), cont.env, cont);
        
        // else-part
        else 
          return LISP.Continuation(list.third(), cont.env, cont);
      });
    
    }),
    
    
    "and": LISP.Builtin(function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a && b;
      }, cont);  
    }),
    
    "or": LISP.Builtin(function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a || b;
      }, cont);  
    }),
    
    "xor": LISP.Builtin(function(list, cont) {
      return LispCompare(list, function(a,b) {
        return (a && !b) || (!a && b);
      }, cont);  
    }),
    
    "not": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        return cont(new LISP.Boolean(!first_arg.value));
      });
    }),
    
    

    "eq?": LISP.Builtin(function(list, cont) {
                
      return LISP.Continuation(list.first(), cont.env, function(first_arg) { 
        return LISP.Continuation(list.second(), cont.env, function(second_arg) { 
          return cont(LISP.compare(first_arg, second_arg) ? LISP.true : LISP.false);         
          
        });        
      });
    }),
    
    "gt?": LISP.Builtin(function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a > b;
      }, cont);  
    }),
    
    "ge?": LISP.Builtin(function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a >= b;
      }, cont);  
    }),
    
    "lt?": LISP.Builtin(function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a < b;
      }, cont);  
    }),
    
    "le?": LISP.Builtin(function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a <= b;
      }, cont);  
    }),   
    
    
    
    "define": LISP.Builtin(function(list, cont) {
      
      var first_arg = list.first();
      
      // define lambda shorthand
      if(first_arg instanceof LISP.Pair) {
        var key = first_arg.first().value,
            body = new LISP.Pair(new LISP.Symbol("begin"), list.rest()),
            lambda = new LISP.Lambda(first_arg.rest(), body, cont.env)
        
        cont.env.set(key, lambda);
        return cont(lambda); 
      
      // regular define
      } else {
        // evaluate second argument
        return LISP.Continuation(list.second(), cont.env, function(second_arg) {
          cont.env.set(first_arg.value, second_arg);
          return cont(second_arg);
        });
      }
    }),
    
    "lambda": LISP.Builtin(function(list, cont) {
      
      var args = list.first(),
          // allow multiple function bodies
          body = new LISP.Pair(new LISP.Symbol("begin"), list.rest());
          
      return cont(new LISP.Lambda(args, body, cont.env));
    }),
    
    // setzt erstes argument im aktuellen binding auf den wert des zweiten arguments
    // liefert dann den Wert des zweiten Arguments zurück
    "set!": LISP.Builtin(function(list, cont) {
    
      // evaluate second argument
      return LISP.Continuation(list.second(), cont.env, function(second_arg) {
        cont.env.set_r(list.first().value, second_arg);
        return Return(second_arg, cont);
      });
    }),
    
    "let": LISP.Builtin(function(list, cont) {
    
      var args = list.first(),
          body = list.second();
            
      return (function bind(args, bind_env) {
        
        var kv_pair = args.first();
        
        return LISP.Continuation(kv_pair.second(), cont.env, function(value) {
      
          bind_env.set(kv_pair.first().value, value);
          
          rest_pairs = args.rest();
          
          // there are still some more args to eval
          if(rest_pairs instanceof LISP.Pair)
            return bind(rest_pairs, bind_env);
            
          else
            return LISP.Continuation(body, bind_env, cont);
                      
        });
      })(args, new LISP.Environment(cont.env));
    }),
    
    "defined?": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(key) {
        return cont((cont.env.get(key.value) !== null) ? LISP.true : LISP.false);
      });
    }),
    
    "typeof": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(value) {
      
        if(!value)
          return cont(LISP.nil);
          
        if(!value.type)
          return cont(new LISP.Symbol("Builtin"));
          
        return cont(new LISP.Symbol(value.type));      
      });
    }),
    
    // already provided in typeof...
    "pair?": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(value) {
        if(value instanceof LISP.Pair)
          return cont(LISP.true);
          
        else
          return cont(LISP.false);
      });
    }),
  
    // sollte liste durchgehen und jedes item einzeln evaluieren. returned letzten
    // return wert  
    
    "begin": LISP.Builtin(function(list, cont) {
    
      function process_lines(lines) {
      
        if(lines.rest() instanceof LISP.Pair)
          return LISP.Continuation(lines.first(), cont.env, function(value) {
            return process_lines(lines.rest());
          });
        
        else 
          return LISP.Continuation(lines.first(), cont.env, cont);
       
      }
      return process_lines(list);
    }),
    
    
    /* not working correctly with
       (define return false) 
        
       (+ 1 (call/cc 
              (lambda (cont) 
                (set! return cont) 
                1))) 
                
       (return 22) ;=> 23
       
    */
    "call/cc": LISP.Builtin(function(list, cont) {
      // First argument of call/cc has to be a function
      return LISP.Continuation(list.first(), cont.env, function(lambda) {
        
        if(!(lambda instanceof LISP.Lambda))
          throw "call/cc has to be called with a Lambda as first argument";
        
        // now bind the current continuation to the first argument of the lambda
        var lambda_env = new LISP.Environment(lambda.defined_env);
        
        lambda_env.set(lambda.args.first().value, cont);
        
        // eval body and continue        
        return LISP.Continuation(lambda.body, lambda_env, cont);
      });
    })
  };


  // Helpermethods  
  
  
  function Return(value, cont) {
    return LISP.Continuation(new LISP.Quoted(value), cont.env, cont);
  }
  
  function LispCompare(list, comparator, cont) {
    
    return LISP.Continuation(list.first(), cont.env, function(first_arg) {
      return LISP.Continuation(list.second(), cont.env, function(second_arg) {  
        
        var comp = comparator(first_arg.value, second_arg.value);
          
        if(typeof comp != "boolean")
          throw "can not compare " + first_arg + " and " + second_arg;
    
        return cont(comp? LISP.true : LISP.false);    
      });        
    });    
  }
  
  
  // Evaluates both arguments and afterwards applies op
  function Calculate(list, cont, op) {
    
    // Evaluate first and second argument
    return LISP.Continuation(list.first(), cont.env, function(first_arg) {
      return LISP.Continuation(list.second(), cont.env, function(second_arg) {
       
      var result = op(first_arg.value, second_arg.value);
      
      if(typeof result == "string")
        return cont(new LISP.String(result));
        
      if(typeof result == "number")
        return cont(new LISP.Number(result));
     
     
      throw result + "is not a number or string";
      });
    });
  }
  
  
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
  
  function Eval_Lambda(lambda, call_args, cont) {

    /*
      - args
      - body
      - called args
      
      ich evaluiere restliste und binde die einzelnen args and die namen der symbols
      aus args im neuen environment.
      evaluiere danach body im neuen env
    */
    
    // call_args mit env evaluieren, lambda mit defined_env evaluieren  
    var lambda_env = new LISP.Environment(lambda.defined_env);
            
    return BindArgs(lambda.args, call_args, lambda_env, cont.env, function(bindings) {
      return LISP.Continuation(lambda.body, bindings, cont);
    });
  }
  
  
  
  /**
   * @function .Eval
   * @returns [LISP.Continuation]
   */
  function Eval(list, cont) {
  
    // if there's no environment, use GLOBAL-one
    cont.env = cont.env || __GLOBAL__;    
    
    function resolve(symbol) {
      var resolved_symbol = cont.env.get(symbol);  
      // cannot resolve this item
      if(resolved_symbol == undefined)
        throw "cannot resolve symbol '"+symbol+"'";
      else
        return resolved_symbol;  
    }
    
    if(list instanceof LISP.Pair) {
    
      // eval first item in list      
      return LISP.Continuation(list.first(), cont.env, function(function_slot) {
      
        var rest_list = list.rest();
        
        // oh there is a lambda-definition in function_slot
        if(function_slot instanceof LISP.Lambda) 
          return Eval_Lambda(function_slot, rest_list, cont);
        
        // It's a continuation, so eval the first argument and call the continuation with it
        if(function_slot instanceof Function && function_slot.type == 'Continuation')
          return LISP.Continuation(rest_list.first(), cont.env, function_slot);

        // seems to be a builtin function
        if(function_slot instanceof Function)
          return function_slot(rest_list, cont); // Diese Ausführung returned eine Continuation
        
        else
          throw "Try to exec non function " + function_slot.to_s();
      
      });
      
    // it's an Symbol, that we want to resolve
    } else if(list instanceof LISP.Symbol) { 
      return cont(resolve(list.value));
      
    // it's quoted, let's unreveal the content
    } else if(list instanceof LISP.Quoted) { 
      return cont(list.value);
      
    // it's some Atom
    } else {    
      return cont(list);
    }
  };
  
  
  function Trampoline(cont) {
       
    while(typeof cont == "function" && cont.type == "Continuation") {
      cont = Eval(cont.list, cont);
    }
    
    return cont;    
  };
  
  function CoopTrampoline(cont, timeslice, wait) {
    
    var start = Date();
    
    // break after 100ms
    while((Date() - start) < timeslice) {
      
      if(cont instanceof Function && cont.type == "Continuation")
        cont = Eval(cont.list, cont);
      
      else return cont;
    }
    
    // continue after 25ms
    setTimeout(function() {
      CoopTrampoline(cont, timeslice, wait);
    }, wait);  
  };
  
  // Init Environment
  var __GLOBAL__ = LISP.Environment(null).set(BuiltIns);
  
  var self = {
    'eval': function(list) {
      var cont = LISP.Continuation(list, __GLOBAL__, function(results) { return results; });
      return Trampoline(cont);
    },
    
    'do': function(string) {
      return self.eval(Parser(string).read());
    },
    
    'read_eval_print': function(string) {
      return self.eval(Parser(string).read()).to_s();
    },
    
    
    // TODO measure total execution time
    'read_all': function(string) {
      var parser = Parser(string);
      var result;
      for(;;) {
        
        if(!!parser.eos())
          return result.to_s();  
        
        else
          result = self.eval(parser.read());
      }
    },
    
    'read_all_coop': function(string, callback) {
      var parser = Parser(string);
      var result;
      for(;;) {
        
        if(!!parser.eos())
          return result.to_s();      
        
        else
          result = self.eval(parser.read());
      }
      
      var cont = LISP.Continuation(list, __GLOBAL__, function(results) { return results; });
      return CoopTrampoline(cont, configs.timeslice, configs.wait);
    },
    
    'environment': __GLOBAL__,
    
    'configure': function(opts) {
      for(option in opts) {
        if(opts.hasOwnProperty(option))
          configs[option] = opts[option];
      }
      return self;
    }
  
  };
  
  return self;
})();
