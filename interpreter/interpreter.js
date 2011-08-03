/**
 * @object Interpreter
 * @requires LISP all datatypes for this interpreter
 * @requires Parser the Lisp-Parser
 */
var Interpreter = (function() {

  // console for outputting builtin print-function
  var print_console = window.console;
  
  var BuiltIns = {
    
    // bekommt zwei Elemente und muss beide evaluieren
    "cons": function(list, cont) {     
      
      // Evaluate first argument
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        // Evaluate second argument
        return LISP.Continuation(list.second(), cont.env, function(second_arg) {
          return cont(new LISP.Pair(first_arg, second_arg));
        });
      }); 
    },
    
    "car": function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        return cont(first_arg.first());
      });
    },
    
    "cdr": function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        return cont(first_arg.rest());
      });
    },
    
    // just do nothing for this eval
    "quote": function(list, cont) {
      return cont(list.first());
    },
    
    "eval": function(list, cont) {
      // Double evaluate
      return LISP.Continuation(list.first(), cont.env, function(first_pass) {
        return LISP.Continuation(first_pass, cont.env, function(second_pass) {
          return cont(second_pass);
        });        
      });
    },
    
    "print": function(list, cont) {    
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        print_console.log(first_arg.to_s());
        return cont(LISP.nil);
      });
    },
    
    "error": function(list, cont) {
      throw (list.to_s());
    },
    
    "inspect": function(list, cont) {
      console.log(list, env);
      return cont(LISP.nil);
    },
    
    "+": function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a+b; });
    },
    
    "-": function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a-b; });
    },
    
    "*": function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a*b; });
    },
    
    "/": function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a/b; });
    },
    
    "%": function(list, cont) {
      return Calculate(list, cont, function(a,b) { return a%b; });
    },
    
    // (if cond if-part else-part)
    "if": function(list, cont) {
      
      return LISP.Continuation(list.first(), cont.env, function(condition) {
               
        // if-part
        if(!!condition.value) 
          return LISP.Continuation(list.second(), cont.env, cont);
        
        // else-part
        else 
          return LISP.Continuation(list.third(), cont.env, cont);
      });
    
    },
    
    "not": function(list, cont) {
      return LISP.Continuation(list.first(), cont.env, function(first_arg) {
        return cont(new LISP.Boolean(!first_arg.value));
      });
    },    
    
    "define": function(list, cont) {
      // evaluate second argument
      return LISP.Continuation(list.second(), cont.env, function(second_arg) {
        cont.env.set(list.first().value, second_arg);
        return cont(second_arg);
      });
    },

    "eq?": function(list, cont) {
                
      return LISP.Continuation(list.first(), cont.env, function(first_arg) { 
        return LISP.Continuation(list.second(), cont.env, function(second_arg) { 
          return cont(LISP.compare(first_arg, second_arg) ? LISP.true : LISP.false);         
          
        });        
      });
    },
    
    "gt?": function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a > b;
      }, cont);  
    },
    
    "ge?": function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a >= b;
      }, cont);  
    },
    
    "lt?": function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a < b;
      }, cont);  
    },
    
    "le?": function(list, cont) {
      return LispCompare(list, function(a,b) {
        return a <= b;
      }, cont);  
    },   
    
    "lambda": function(list, cont) {
      
      var args = list.first(),
          body = list.second();
          
      return cont(new LISP.Lambda(args, body, cont.env));
    },
    
    // setzt erstes argument im aktuellen binding auf den wert des zweiten arguments
    // liefert dann den Wert des zweiten Arguments zurück
    "set!": function(list, cont) {
    
      // evaluate second argument
      return LISP.Continuation(list.second(), cont.env, function(second_arg) {
        cont.env.set_r(list.first().value, second_arg);
        return cont(second_arg);
      });
    },
    
    "let": function(list, cont) {
    
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
    },
  
    // sollte liste durchgehen und jedes item einzeln evaluieren. returned letzten
    // return wert  
    "begin": function(list, cont) {    
      return (function eval_lines(lines) {        
        return LISP.Continuation(lines.first(), cont.env, function(value) {
          
          var rest_lines = lines.rest();
          
          if(rest_lines instanceof LISP.Pair)
            return eval_lines(rest_lines);
            
          else return cont(value);      
        });
      })(list);
    }
  };


  // Helpermethods
  
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
          
        //console.log("inside of eval", function_slot, rest_list);
        
        // oh there is a lambda-definition in function_slot
        if(function_slot instanceof LISP.Lambda) 
          return Eval_Lambda(function_slot, rest_list, cont);
        
        // seems to be a builtin function
        if(function_slot instanceof Function)
            return function_slot(rest_list, cont); // Diese Ausführung returned eine Continuation
           
        else
          throw "Try to exec non function " + function_slot.to_s();
      
      });
      
    // it's an Symbol, that we want to resolve
    } else if(list instanceof LISP.Symbol) { 
      return cont(resolve(list.value));
      
    // it's some Atom
    } else {    
      return cont(list);
    }
  };
  
  
  function Trampoline(list) {
    
    var cont = LISP.Continuation(list, __GLOBAL__, function(results) { return results; });
       
    while(typeof cont == "function" && !!cont.is_continuation) {
      // console.log(cont.inspect());
      //var evaled = Eval(cont.list, cont);
      
      //console.log("Evaluiert:", evaled);
      /*
      if(!!evaled.is_continuation)
        cont = evaled
      else*/
      cont = Eval(cont.list, cont); //cont(evaled);
    }
    
    return cont;    
  };
  
  
  
  // Init Environment
  var __GLOBAL__ = LISP.Environment(null).set(BuiltIns);

  var self = {
    
    'trampoline': Trampoline,
    
    'eval': Eval,
    
    'print': function(ast) {

      if(ast instanceof LISP.Pair)    
        return "(" + self.print(ast.first()) + 
                " . " + self.print(ast.rest()) +")";
      
      return ast.to_s();
    },
    
    'do' : function(string) {
      return self.trampoline(Parser(string).read()).to_s();
    },
    
    'read_eval_print': function(string) {
      var parser = Parser(string);
      return self.print(self.eval(parser.read()));
    },
    
    'read_all': function(string) {
      var parser = Parser(string);
      var last_out = "";
      
      while(!parser.eos()) {
        last_out = self.print(self.eval(parser.read()));
      }
      return last_out;
    },
    
    'environment': __GLOBAL__,
    
    'setConsole': function(console) {
      print_console = console;
    }
  
  };
  
  return self;
})();
