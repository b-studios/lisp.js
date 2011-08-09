(function() {
  
  // local helpers  
  var p = function(a,b) { return new LISP.Pair(a,b) },
      sym = function(v) { return new LISP.Symbol(v); },
      s = function(v) { return new LISP.String(v); },
      n = function(v) { return new LISP.Number(v); },
      q = function(v) { return new LISP.Quoted(v); },
      nil = LISP.nil,
      
      test_parser = function(to_parse, result) {
        var parser = Parser(to_parse);
        LISP.equals(parser.read(), result);      
        ok(parser.eos(), "End of String");
      };

  module("Parser");

  test("Basic parsing functionality", function() {
    test_parser( "Foo", 
                 sym("Foo") );
                 
    test_parser( "12345", 
                 n(12345) );
    
    test_parser( '"Foo Bar"', 
                 s("Foo Bar") );

    test_parser( "true", 
                 LISP.True );
                 
    test_parser( "false", 
                 LISP.False );
                 
    test_parser( "nil", 
                 LISP.nil );
  });
    
  test("Lists", function() {
    
    test_parser( "(Foo Bar)", 
                 p(sym("Foo"), p(sym("Bar"), nil)) );
                 
    test_parser( "(Foo (Bar Boo))", 
                 p(sym("Foo"), p(p(sym("Bar"), p(sym("Boo"), nil)), nil)) );
                 
    test_parser( "(Foo . Bar)", 
                 p(sym("Foo"), sym("Bar")) );
  });
  
  test("Quotes", function() {
    
    test_parser( "'Foo", 
                 q(sym("Foo")) );

    test_parser( "'(Foo)", 
                 q(p(sym("Foo"), nil)) );
  });
      
  test("Numbers", function() {
    
    test_parser( "-5",
                 n(-5) );
                 
    test_parser( "0",
                 n(0) );
    
    test_parser( "0.5",
                 n(0.5) );
    
    test_parser( "-0.5",
                 n(-0.5) );             
  });
        
})();
