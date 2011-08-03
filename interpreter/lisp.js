// Datatypes
var LISP = LISP || {};

LISP.Pair = function(first, rest) {

  this[0] = first;
  this[1] = rest;

  this.first = function() {
    return this[0];
  };

  this.rest = function() {
    return this[1];
  };
  
  this.second = function() {
    return this.rest().first();
  };
  
  this.third = function() {
    return this.rest().rest().first();
  };
  
  this.to_s = function() { return "(" + this[0].to_s() + " . " + this[1].to_s() + ")"; }
};

LISP.Number = function(value) {
  this.value = Number(value);
  this.to_s = function() { return "" + this.value; };
};

LISP.String = function(value) {
  this.value = value;
  this.to_s = function() { return '"' + this.value + '"'; };
};

LISP.Quoted = function(value) {
  this.value = value;
  this.to_s = function() { return "'" + this.value; };
};

LISP.Symbol = function(value) {
  this.value = value;
  this.to_s = function() { return "" + this.value; };
};

LISP.Boolean = function(value) {
  this.value = !!value;
  this.to_s = function() { return "" + this.value; };
};

LISP.Nil = function() {
  this.value = "nil";
  this.to_s = function() { return "nil" };
};

LISP.Lambda = function(args, body, defined_env) {
  this.args = args;
  this.body = body;
  this.defined_env = defined_env;
  
  this.to_s = function() { return "<userdefined function>" };
};

/**
 * Environment is a perfect usecase for prototypal inheritence
 * But if we wan't to include methods, like setting multiple bindings at once
 * this method could be overwritten by a binding.
 *
 * Normal use could look like
 * 
 *    var env = new LISP.Environment(null);
 *    env.foo = 4;
 *    env.bar = 5;
 *    env.bar //=> 5
 *
 *    var env2 = LISP.Environment(env);
 *    env2.baz = 6;
 */
LISP.Environment = function(parent) {
  
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
    
    set_r: function(key, value) {
      if(!!store.hasOwnProperty(key))
        store[key] = value;
        
      else if(!!parent)
        parent.set_r(key, value);
        
      else
        throw key + " is not defined, and cannot be set to " + value;
        
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


LISP.Continuation = function(list, env, cont) {
  
  cont.env             = env;
  cont.to_s            = function() { return "<continuation>" };
  cont.is_continuation = true;
  cont.list            = list;
  cont.inspect         = function() { return {
    env: env, 
    cont: cont,
    list: list  
  }};
  
  return cont;
}

LISP.true = new LISP.Boolean(true);

LISP.false = new LISP.Boolean(false);

LISP.nil= new LISP.Nil();

LISP.compare = function(a,b) {
  if(a instanceof LISP.Pair && b instanceof LISP.Pair)
    return LISP.compare(a.first(), b.first()) && LISP.compare(a.rest(), b.rest());
  else 
    return a.value == b.value;
}
