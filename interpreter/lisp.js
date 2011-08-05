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
  
  this.type = "Pair";
};

LISP.Number = function(value) {
  this.value = Number(value);
  this.to_s = function() { return "" + this.value; };
  this.type = "Number";
};

LISP.String = function(value) {
  this.value = value;
  this.to_s = function() { return '"' + this.value + '"'; };
  this.type = "String";
};

LISP.Quoted = function(value) {
  this.value = value;
  this.to_s = function() { return "'" + this.value.to_s(); };
  this.type = "Quoted";
};

LISP.Symbol = function(value) {
  this.value = value;
  this.to_s = function() { return "" + this.value; };
  this.type = "Symbol";
};

LISP.Boolean = function(value) {
  this.value = !!value;
  this.to_s = function() { return "" + this.value; };
  this.type = "Boolean";
};

LISP.Nil = function() {
  this.value = "nil";
  this.to_s = function() { return "nil" };
  this.type = "Nil";  
};

LISP.Lambda = function(args, body, defined_env) {
  this.args = args;
  this.body = body;
  this.defined_env = defined_env;
  this.type = "Lambda";  
  this.to_s = function() { return "&lt;Userdefined Function&gt;" };
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
      } else {
        return null;
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
    'super': parent,
    to_s: function() { return "&lt;Environment&gt;"; },
    type: "Environment"
  };
  
  return env;
};


LISP.Continuation = function(list, env, cont) {
  
  cont.env             = env;
  cont.to_s            = function() { return "&lt;Continuation&gt;" };
  cont.list            = list;
  cont.type = "Continuation";
  return cont;
}

LISP.Builtin = function(method) {  
  method.to_s = function() { return "&lt;Native Function&gt;"; }
  method.type = "Builtin";
  return method;
};


LISP.Result = function(data) {
  var result = {
    data: data,
    to_s: function() { return data.to_s(); },
    type: 'Result'
  }  
  return result;  
};

LISP.true = new LISP.Boolean(true);

LISP.false = new LISP.Boolean(false);

LISP.nil= new LISP.Nil();

LISP.compare = function(a,b) {
  if(a instanceof LISP.Pair && b instanceof LISP.Pair)
    return LISP.compare(a.first(), b.first()) && LISP.compare(a.rest(), b.rest());
  
  else if(a instanceof LISP.Quoted && b instanceof LISP.Quoted)
    return LISP.compare(a.value, b.value);
  
  else
    return a.value == b.value;
}
