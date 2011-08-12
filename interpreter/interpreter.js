var Interpreter = (function() {
  
  // The top-environment
  var __GLOBAL__;
  
  var configs = {
    
    worker: false,
    
    coop: true,
    
    // timeslice in ms
    timeslice: 100,
    
    // time to wait, until continuing
    wait: 25
  
  };
  
  var builtins = {
         
    "assert": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(value) {
        if(value == LISP.True)
          return cont(LISP.nil);
        else
          return LISP.Continuation(list.second(), cont.env, function(msg) {
            throw("Assertion failure: " + msg.to_s());
          });
      });    
    }),
    
    
    // @group List Manipulation
    
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
        if(first_arg instanceof LISP.Pair)
          return cont(first_arg.first());
        
        else throw("Cannot calculate car of " + first_arg.type + " " + first_arg.to_s());
      });
    }),
         
    "cdr": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        if(first_arg instanceof LISP.Pair)
          return cont(first_arg.rest());
        
        else throw("Cannot calculate cdr of " + first_arg.type + " " + first_arg.to_s());
      });
    }),    
     
     
    // @group Quote and Eval
         
    "quote": LISP.Builtin(function(list, cont) {
      return cont(list.first());
    }),
    
    "get-bindings": LISP.Builtin(function(list, cont) {
      return cont(cont.env);
    }),
    
    "eval": LISP.Builtin(function(list, cont) {
      
      return LISP.Continuation(list.first(), cont.env, function(first_pass) {
        
        if(list.rest() instanceof LISP.Pair)        
          return LISP.Continuation(list.second(), cont.env, function(environment) {
            return LISP.Continuation(first_pass, environment, cont);
          });
          
        else        
          return LISP.Continuation(first_pass, cont.env, cont);
      });      
    }),
    
      
    
    // @group Mathematical operators
    
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
        
    
    // @group Logical Operators
    
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
    
    
    // @group Comparators

    "eq?": LISP.Builtin(function(list, cont) {                
      return LISP.Continuation(list.first(), cont.env, function(first_arg) { 
        return LISP.Continuation(list.second(), cont.env, function(second_arg) { 
          return cont(LISP.compare(first_arg, second_arg) ? LISP.True : LISP.False);          
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
    
    
    // @group Environment manipulation
    
    "define": LISP.Builtin(function(list, cont) {
      
      var first_arg = list.first();
      
      // define lambda shorthand
      if(first_arg instanceof LISP.Pair) {
        var key = first_arg.first().value,
            body = list.rest(),
            lambda = new LISP.Lambda(first_arg.rest(), body, cont.env);
            
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
    
    "set!": LISP.Builtin(function(list, cont) {
    
      // evaluate second argument
      return LISP.Continuation(list.second(), cont.env, function(second_arg) {
        cont.env.set_r(list.first().value, second_arg);
        return cont(second_arg);
      });
    }),
    
    "let": LISP.Builtin(function(list, cont) {
    
      var args = list.first(),
          body = list.rest();
            
      return (function bind(args, bind_env) {
        
        var kv_pair = args.first();
        
        return LISP.Continuation(kv_pair.second(), cont.env, function(value) {
      
          bind_env.set(kv_pair.first().value, value);
          
          rest_pairs = args.rest();
          
          // there are still some more args to eval
          if(rest_pairs instanceof LISP.Pair)
            return bind(rest_pairs, bind_env);
            
          else
            return EvalMultiple(body, bind_env, cont);
                      
        });
      })(args, new LISP.Environment(cont.env));
    }),
    
    "defined?": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(key) {
        return cont((cont.env.get(key.value) !== null) ? LISP.True : LISP.False);
      });
    }),
    
    /**
     * Resets the Global environment
     */
    "reset": LISP.Builtin(function(list, cont) {
      __GLOBAL__ = LISP.Environment(null).set(builtins);    
      return cont(LISP.nil);
    }),
    
    
    // @group Strings and Symbols
    
    "to_s": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(symbol) {
        return cont(new LISP.String(symbol.value));
      });
    }),
    
    "to_sym": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(string) {
        return cont(new LISP.Symbol(string.value));
      });
    }),
    
    "split": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(string) {
         
         string = string.value;
         
         // Create LISP-list
         var list = LISP.nil;
         
         for(var i=string.length-1;i>=0;i--)
           list = new LISP.Pair(new LISP.String(string.charAt(i)), list);
        
        return cont(list);
       });
    }),
    
    "join": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(list) {
        
        function Helper(list, string) {
          if(!(list instanceof LISP.Pair))
            return string;
          
          return Helper(list.rest(), string + list.first().value);
        }
        
        return cont(new LISP.String(Helper(list, "")));        
      });
    }),
    
    
    // @group Introspection
    
    "typeof": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(value) {
      
        if(!value)
          return cont(LISP.nil);
          
        if(!value.type)
          return cont(new LISP.Symbol("Builtin"));
          
        return cont(new LISP.Symbol(value.type));    
      });
    }),
        
    
    // @group Program flow
    
    "if": LISP.Builtin(function(list, cont) {
      
      return LISP.Continuation(list.first(), cont.env, function(condition) {
        
        if(!(condition instanceof LISP.Boolean))
          throw("Condition has to eval to boolean (got: " + condition.to_s() + ")");
        
        // if-part
        if(!!condition.value) 
          return LISP.Continuation(list.second(), cont.env, cont);
        
        // else-part
        else 
          return LISP.Continuation(list.third(), cont.env, cont);
      });
    
    }),
    
    "begin": LISP.Builtin(function(list, cont) {
      return EvalMultiple(list, cont.env, cont);
    }),
    
    "lambda": LISP.Builtin(function(list, cont) {
      
      var args = list.first(),
          // allow multiple function bodies
          body = list.rest();
          
      return cont(new LISP.Lambda(args, body, cont.env));
    }),
    
    // @group Macros
    
    "defmacro": LISP.Builtin(function(list, cont) {      
      var macro = new LISP.Macro(list.second(), list.third());
      cont.env.set(list.first().value, macro);
      return cont(macro);      
    }),
    
    "macroexpand": LISP.Builtin(function(list, cont) {
      // list.first should be a macro, list.rest() the argument list
      return LISP.Continuation(list.first(), cont.env, function(macro) {
        return MacroExpand(macro, list.rest(), cont);
      });
    }),
    
    
    // @group Continuations
    
    "call/cc": LISP.Builtin(function(list, cont) {
      // First argument of call/cc has to be a function with one argument
      return LISP.Continuation(list.first(), cont.env, function(lambda) {
        
        if(!(lambda instanceof LISP.Lambda))
          throw("call/cc has to be called with a Lambda as first argument");
        
        return EvalLambda(lambda, new LISP.Pair(cont, LISP.nil), cont);        
      });
    }), 
    
  
    // @group printing and system configurations   
    
    "print": LISP.Builtin(function(list, cont) {
    
      if(!(list instanceof LISP.Pair))
        throw("print requires one argument, not " + list.to_s());
          
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        configs.console.log(first_arg.to_s());
        return cont(LISP.nil);
      });
    }),
    
    "error": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(evaled) {
        throw(evaled.to_s());
      });
    }),
    
    "inspect": LISP.Builtin(function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(evaled) {
        (!!window && window.console || configs.console).log(evaled);
        return cont(LISP.nil);
      });
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
  
  // Helpermethods  
  
  function LispCompare(list, comparator, cont) {
    
    return LISP.Continuation(list.first(), cont.env, function(first_arg) {
      return LISP.Continuation(list.second(), cont.env, function(second_arg) {  
        
        var comp = comparator(first_arg.value, second_arg.value);
          
        if(typeof comp != "boolean")
          throw("can not compare " + first_arg + " and " + second_arg);
    
        return cont(comp? LISP.True : LISP.False);    
      });        
    });    
  }
  
  
  // Evaluates both arguments and afterwards applies op
  function Calculate(list, cont, op) {
    
    return EvalEachInList(list, cont.env, function(evaled_list) {
      // use first arg as result
      var result = evaled_list.first();
      
      while(evaled_list.rest() !== LISP.nil) {
        evaled_list = evaled_list.rest();
              
        result = op(result.value, evaled_list.first().value);
        
        // convert to LISP-Atom        
        if(typeof result == "string")
          result = new LISP.String(result);
          
        else if(typeof result == "number")
          result = new LISP.Number(result);
          
        else throw(result + " is not a number or string");
      }
      return cont(result);      
    });    
  }
  
  function MacroExpand(macro, call_args, cont) {
    
    var expansion_env = LISP.Environment(__GLOBAL__),
        value_rest = call_args,
        key_rest = macro.args;
    
    // just bind call_args to expansion_env   
    while(key_rest instanceof LISP.Pair && value_rest instanceof LISP.Pair) {
      expansion_env.set(key_rest.first().value, value_rest.first());
      key_rest   = key_rest.rest();
      value_rest = value_rest.rest();    
    }    

    // bind varargs
    if(key_rest instanceof LISP.Symbol) {
      expansion_env.set(key_rest.value, value_rest);
    }
    
    // eval first time in expansion environment
    return LISP.Continuation(macro.body, expansion_env, function(evaled_body) {
      // now expand
      return Expand(evaled_body, expansion_env, cont);    
    });
  }
  
  function Expand(list, env, cont) {
     
    // The only thing we do is, to search for BackQuotes and eval them in our 
    // expansion environment
    if(list instanceof LISP.Pair)
      return Expand(list.first(), env, function(first_el) {
        return Expand(list.rest(), env, function(rest_el) {
          return cont(new LISP.Pair(first_el, rest_el)); 
        });
      });
            
    // it's a BackQuote
    else if(list instanceof LISP.BackQuote)
      return LISP.Continuation(list.value, env, cont);
    
    // something else
    else return cont(list);
  }
  
  // Evaluates each item of the list and returns a new list, with the evaluated
  // results
  // Used by lambda to eval all passed arguments
  function EvalEachInList(args, env, cont) {
        
      function Helper(args, evaled_values, cont) {          
      
        if(args instanceof LISP.Pair)        
          return LISP.Continuation(args.first(), env, function(value) {
            evaled_values.push(value);
            return Helper(args.rest(), evaled_values, cont);    
          });
        
        else return cont(evaled_values);
        
     }
      
     return Helper(args, [], function(evaled_values) {
       
       // convert array to lisp-list (careverted)         
       var list = LISP.nil;
       
       for(var i=evaled_values.length-1;i>=0;i--)
         list = new LISP.Pair(evaled_values[i], list);
       
       return cont(list);
     });
  }
  
  // Is used by lambda-evaluation, begin and let
  function EvalMultiple(list, env, cont) {
    function process_lines(lines) {
    
      if(!(lines instanceof LISP.Pair))
        return LISP.Continuation(lines, env, cont);
        
      if(lines.rest() instanceof LISP.Pair)
        return LISP.Continuation(lines.first(), env, function(value) {
          return process_lines(lines.rest());
        });
      
      else 
        return LISP.Continuation(lines.first(), env, cont);
     
    }
    return process_lines(list);
  }
  
  
  
  // Evaluators
  
  /**
   * Lambdas with var-args:
   * If the last list member isn't nil, but a symbol, then the list of following
   * evaluated values is bound to this member.
   *
   * The rest of key_args is either a pair (Another list) or the end of the list
   * i.e. LISP.Symbol or LISP.nil
   */
  function EvalLambda(lambda, call_args, cont) {
    
    var lambda_env = new LISP.Environment(lambda.defined_env);    

    function BindArgs(key_args, value_args, bind_env, eval_env, cont) {
      
      // empty arguments
      if(value_args == LISP.nil || key_args instanceof LISP.Pair && key_args.first() == LISP.nil)
        return cont(bind_env);
      
      // eval all value-arguments
      return EvalEachInList(value_args, eval_env, function(values) {
            
        var keys_rest = key_args,
            values_rest = values;
      
        while(keys_rest instanceof LISP.Pair && values_rest instanceof LISP.Pair) {
          bind_env.set(keys_rest.first().value, values_rest.first());         
          values_rest = values_rest.rest();
          keys_rest   = keys_rest.rest();        
        }
        
        // bind varargs        
        if(keys_rest instanceof LISP.Symbol) {
          bind_env.set(keys_rest.value, values_rest || LISP.nil);
          return cont(bind_env);
        }
        
        // everything went fine
        if(keys_rest === LISP.nil && values_rest === LISP.nil)
          return cont(bind_env);
        
        else throw("Lambda called with wrong number of arguments." + " \n  expected: "+lambda.args.to_s()+"\n  got: "+call_args.to_s()) +  "\n  Lambdabody: "+ lambda.body.to_s();
        
      });
    }
         
    return BindArgs(lambda.args, call_args, lambda_env, cont.env, function(bindings) {    
      return EvalMultiple(lambda.body, bindings, cont);
    });
  }
  
  
  // The call_args are not evaluated in a macro, their lists, are simply bound to
  // the macro's arguments (which can be access via backquote only)
  function EvalMacro(macro, call_args, cont) {    
    // first expand macro with macro_env
    return MacroExpand(macro, call_args, function(expanded) {
      // now eval expanded version
      return LISP.Continuation(expanded, cont.env, cont);
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
        
        // wow, a macro - let's eval it!  
        if(function_slot instanceof LISP.Macro) 
          return EvalMacro(function_slot, rest_list, cont);
        
        // It's a continuation, so eval the first argument and call the continuation with it
        if(function_slot instanceof Function && function_slot.type == 'Continuation')
          return LISP.Continuation(rest_list.first(), env, function_slot);
        
        // seems to be a builtin function
        if(function_slot instanceof Function && function_slot.type == 'Builtin')
          return function_slot(rest_list, cont);
        
        throw("Try to exec non function " + function_slot.to_s());
      });
      
    // it's an Symbol, that we want to resolve
    } else if(list instanceof LISP.Symbol) { 
      var resolved = env.get(list.value);

      if(resolved == undefined) {
        throw("cannot resolve symbol '"+ list.value +"'");
      }
      return cont(resolved);
      
    // it's quoted, let's reveal the content
    } else if(list instanceof LISP.Quoted) { 
      return Expand(list.value, cont.env, cont);
      
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
       
    while(typeof cont == "function" && cont.type == "Continuation") {
      cont = Eval(cont.list, cont);
    }
          
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
  
  
  // init global environment
  __GLOBAL__ = LISP.Environment(null).set(builtins);    
  
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
    }
  
  };
  
})();
