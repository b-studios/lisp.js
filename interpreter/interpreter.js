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

    // <------------- Bis hier in CPS umgewandelt
    
    // setzt erstes argument im aktuellen binding auf den wert des zweiten arguments
    // liefert dann den Wert des zweiten Arguments zurück
    "set!": function(list, env) {
    
      var first = list.first(),
          second = list.second();
      
      // ERROR: Fehlt irgendwie
      // Muss das entsprechende Binding aus der Chain suchen und danach den wert
      // setzen
      set_r(first.value, second, env);
      return second;
    },
    
    "let": function(list, env) {
    
      var args = list.first(),
          body = list.second();
      
      var let_env = new LISP.Environment(env);
    
      var bind_args = function(pairs) {
        
          if(pairs == LISP.nil) return;
                
          var arg_pair = pairs.first();
      
          if(arg_pair instanceof LISP.Pair) {
            // resolve values with env
            let_env.set(arg_pair.first().value, Eval(arg_pair.second(), env));
            bind_args(pairs.rest());
          }
      };
      
      bind_args(args);
      
      return Eval(body, let_env);    
    },

    // sollte liste durchgehen und jedes item einzeln evaluieren. returned letzten
    // return wert  
    "begin": function(list, env) {
      
      var eval_list = function(list) {
        if(list.rest() == LISP.nil)
          return Eval(list.first(), env);
        else {
          Eval(list.first(), env);
          return eval_list(list.rest());
        }        
      };    
      return eval_list(list);    
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
    
    // eval args - use closure to process list of args
    var lambda_args = lambda.args;
    
    var bind_args = function() {
    
      // Create a Continuation, which can used to bind the first evaled value to
      // the first symbol of lambda's argument list
      return LISP.Continuation(call_args.first(), cont.env, function(value) {
        lambda_env.set(lambda_args.first().value, value);
        
        lambda_args = lambda_args.rest();
        call_args = call_args.rest();
        
        // there are still some more args to eval
        if(call_args instanceof LISP.Pair)
          return bind_args();
          
        else
          return LISP.Continuation(lambda.body, lambda_env, cont);
      });
    }
    
    // start binding args
    return bind_args();
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
