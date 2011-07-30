/**
 * @object Interpreter
 * @requires LISP all datatypes for this interpreter
 * @requires Parser the Lisp-Parser
 */
var Interpreter = (function() {

  // console for outputting builtin print-function
  var print_console = window.console;

  var Environment = function(parent) {
    
    var store = {};
    
    var env = {
      // get binding
      get: function(key) {
        if(store.hasOwnProperty(key)) {
          return store[key];
        } else if(parent != null) {
          return parent.get(key);
        }
      },
      
      // set binding
      set: function(key_or_object, value) {      
        if(arguments.length == 1) {
          for(key in key_or_object) {
            if(key_or_object.hasOwnProperty(key))
              store[key] = key_or_object[key];    
          }
        } else {    
          store[key_or_object] = value;
        }
        
        return env;
      },
      
      defined: function(key) {
        return store.hasOwnProperty(key)      
      },
      
      bindings: store,
      'super': parent
    };
    
    return env;
  };
  
  var BuiltIns = {
    
    // bekommt zwei Elemente und muss beide evaluieren
    "cons": function(list, env) {
      return new LISP.Pair(Eval(list.first(), env), Eval(list.second(), env)); 
    },
    
    "car": function(list, env) {
      return Eval(list.first(), env).first();
    },
    
    "cdr": function(list, env) {
      return Eval(list.first(), env).rest();
    },
    
    // just do nothing for this eval
    "quote": function(list, env) {
      return list.first();
    },
    
    "eval": function(list, env) {
      return Eval(Eval(list.first(), env), env);
    },
    
    "print": function(list, env) {
      print_console.log(Eval(list.first(), env).to_s());
      return LISP.nil;
    },
    
    "error": function(list, env) {
      throw (list.to_s());
    },
    
    "inspect": function(list, env) {
      console.log(list, env);
      return LISP.nil;
    },
    
    "+": function(list, env) {    
      return Calculate(list, env, function(a,b) { return a+b; });
    },
    
    "-": function(list, env) {
      return Calculate(list, env, function(a,b) { return a-b; });
    },
    
    "*": function(list, env) {
      return Calculate(list, env, function(a,b) { return a*b; });
    },
    
    "/": function(list, env) {
      return Calculate(list, env, function(a,b) { return a/b; });
    },
    
    "%": function(list, env) {
      return Calculate(list, env, function(a,b) { return a%b; });
    },
    
    // (if cond if-part else-part)
    "if": function(list, env) {
      cond = Eval(list.first(), env).value;
      
      // if-part
      if(cond) 
        return Eval(list.second(), env);
      
      // else-part
      else return Eval(list.third(), env);
    },
    
    "not": function(list, env) {
      //return !Eval(list.first()).value
    },    
    
    "define": function(list, env) {
      var first = list.first(),
          second = list.second();
    
      env.set(first.value, Eval(second, env));
      return second;
    },
    
    // setzt erstes argument im aktuellen binding auf den wert des zweiten arguments
    // liefert dann den Wert des zweiten Arguments zurück
    "set!": function(list, env) {
    
      var first = list.first(),
          second = list.second();
      
      set_r(first.value, second, env);
      return second;
    },
    
    "let": function(list, env) {
    
      var args = list.first(),
          body = list.second();
      
      var let_env = new Environment(env);
    
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
    
    "lambda": function(list, env) {
      
      var args = list.first(),
          body = list.second();
      
      // third argument is the defined_in environment
      return new LISP.Lambda(args, body, env);
    },

    "eq?": function(list, env) {
      
      var first = list.first(),
          second = list.second();
    
      var comp = function(a, b) {
      
        if(a instanceof LISP.Pair && b instanceof LISP.Pair)
          return comp(a.first(), b.first()) && comp(a.rest(), b.rest());
        else if(a.value == b.value)
          return LISP.true;
        else
          return LISP.false; 
      };
      
      return comp(Eval(first, env), Eval(second, env));
    },
    
    "gt?": function(list, env) {
      return LispCompare(list, function(a,b) {
        return a > b;
      }, env);  
    },
    
    "ge?": function(list, env) {
      return LispCompare(list, function(a,b) {
        return a >= b;
      }, env);  
    },
    
    "lt?": function(list, env) {
      return LispCompare(list, function(a,b) {
        return a < b;
      }, env);  
    },
    
    "le?": function(list, env) {
      return LispCompare(list, function(a,b) {
        return a <= b;
      }, env);  
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
  
  function LispCompare(list, comparator, env) {
    var first = Eval(list.first(), env),
        second = Eval(list.second(), env);    
      
    var comp = comparator(first.value, second.value);
      
    if(typeof comp != "boolean")
      throw "can not compare " + first + " and " + second;
        
    return comp? LISP.true : LISP.false;    
  }
  
  function Calculate(list, env, op) {
      
    var first_arg = Eval(list.first(), env),
        second_arg = Eval(list.second(), env);
    
    var result = op(first_arg.value, second_arg.value);
    
    if(typeof result == "string")
      return new LISP.String(result);
      
    if(typeof result == "number")
      return new LISP.Number(result);
    
    throw result + "is not a number or string"
  }
  
  function Eval_Lambda(lambda, call_args, env) {

    /*
      - args
      - body
      - called args
      
      ich evaluiere restliste und binde die einzelnen args and die namen der symbols
      aus args im neuen environment.
      evaluiere danach body im neuen env
    */
    
    // call_args mit env evaluieren, lambda mit defined_env evaluieren  
    var lambda_env = new Environment(lambda.defined_env);
    
    var bind_args = function(symbols, values) {
        if(values instanceof LISP.Pair) {
          // resolve values with env
          lambda_env.set(symbols.first().value, Eval(values.first(), env));
          bind_args(symbols.rest(), values.rest());
        } else {
          // varargs??
        }
    };
    
    if(window.console != undefined) console.log(lambda_env);
    
    bind_args(lambda.args, call_args);
    
    return Eval(lambda.body, lambda_env);  
  }
  
  
  
  function Eval(item, env) {
  
    env = env || __GLOBAL__;
    
    
    function resolve(symbol) {
      var resolved_symbol = env.get(symbol);  
      // cannot resolve this item
      if(resolved_symbol == undefined)
        throw "cannot resolve symbol '"+symbol+"'";
      else
        return resolved_symbol;  
    }
    
    if(item instanceof LISP.Pair) {
    
      // eval first item in list
      var function_slot = Eval(item.first(), env),
          rest_list = item.rest();
      
      // oh there is a lambda-definition in function_slot
      if(function_slot instanceof LISP.Lambda)      
        return Eval_Lambda(function_slot, rest_list, env);
      
      if(function_slot instanceof Function)
          return function_slot(item.rest(), env);
         
      else
        throw "Try to exec non function " + function_slot.to_s();
      
    // it's an Symbol, that we want to resolve
    } else if(item instanceof LISP.Symbol) { 
      return resolve(item.value);
      
    // it's some Atom
    } else {    
      return item;
    }
  };
  
  
  // Init Environment
  var __GLOBAL__ = Environment(null).set(BuiltIns);

  var self = {
    
    'eval': Eval,
    
    'print': function(ast) {

      if(ast instanceof LISP.Pair)    
        return "(" + self.print(ast.first()) + 
                " . " + self.print(ast.rest()) +")";
      
      return ast.to_s();
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
