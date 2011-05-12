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
  
  this.to_s = function() { return "<userdefined lambda>" };
};

LISP.true = new LISP.Boolean(true);

LISP.false = new LISP.Boolean(false);

LISP.nil= new LISP.Nil();
