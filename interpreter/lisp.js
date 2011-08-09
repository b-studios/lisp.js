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
  
  this.to_s = function(child_of_a_list) { 
    
    var we_are_list = (this[1] instanceof LISP.Pair);
    
    // we are a list inside of a list
    if(we_are_list && !!child_of_a_list)
      return this[0].to_s() + " " + this[1].to_s(true);
    
    // we are a list and our parent is not a list
    else if(we_are_list && !child_of_a_list) 
      return "(" + this[0].to_s() + " " + this[1].to_s(true) + ")";
    
    // we are not a list, but a child of a list  
    else if(!we_are_list && !!child_of_a_list) {
      
      if(this[1] == LISP.nil)
        return this[0].to_s();
        
      else
        return "(" + this[0].to_s() + " . " + this[1].to_s() + ")";
    
    }
    
    else if(!we_are_list && !child_of_a_list)
      return "(" + this[0].to_s() + " . " + this[1].to_s() + ")";
  }
  
  this.type = "Pair";
};

LISP.Number = function(value) {
  this.value = Number(value);
  this.to_s  = function() { return "" + this.value; };
  this.type  = "Number";
};

LISP.String = function(value) {
  this.value = value;
  this.to_s  = function() { return '"' + this.value + '"'; };
  this.type  = "String";
};

LISP.Quoted = function(value) {
  this.value = value;
  this.to_s  = function() { return "'" + this.value.to_s(); };
  this.type  = "Quoted";
};

LISP.BackQuote = function(value) {
  this.value = value;
  this.to_s  = function() { return "," + this.value.to_s(); };
  this.type  = "BackQuote";
};

LISP.Symbol = function(value) {
  this.value = value;
  this.to_s  = function() { return "" + this.value; };
  this.type  = "Symbol";
};

LISP.Boolean = function(value) {
  this.value = !!value;
  this.to_s  = function() { return "" + this.value; };
  this.type  = "Boolean";
};

LISP.Nil = function() {
  this.value = "nil";
  this.to_s  = function() { return "nil" };
  this.type  = "Nil";  
};

LISP.Lambda = function(args, body, defined_env) {
  this.args = args;
  this.body = body;
  this.defined_env = defined_env;
  this.type = "Lambda";  
  this.to_s = function() { return "&lt;Userdefined Function&gt;" };
};

LISP.Macro = function(args, body) {
  this.args = args;
  this.body = body;
  this.type = "Macro";
  this.to_s = function() { return "&lt;Userdefined Macro&gt;"; }
};

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
  
  cont.env  = env;
  cont.to_s = function() { return "&lt;Continuation&gt;" };
  cont.list = list;
  cont.type = "Continuation";
  return cont;
};


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

LISP.True = new LISP.Boolean(true);

LISP.False = new LISP.Boolean(false);

LISP.nil = new LISP.Nil();

LISP.compare = function(a,b) {
  if(a instanceof LISP.Pair && b instanceof LISP.Pair)
    return LISP.compare(a.first(), b.first()) && LISP.compare(a.rest(), b.rest());
  
  else if(a instanceof LISP.Quoted && b instanceof LISP.Quoted)
    return LISP.compare(a.value, b.value);
  
  else
    return a.value == b.value;
}
