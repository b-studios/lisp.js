/*
    Read("foosdfs").assert(sym("foosdfs"));
    Read("1234").assert(i("1234"));
    Read("(Foo Bar)").assert(p(sym("Foo"), p(sym("Bar"), nil)));
    Read("(Foo (Bar Boo))").assert(p(sym("Foo"), p(p(sym("Bar"), p(sym("Boo"), nil)), nil)));
    Read("(Foo . Bar)").assert(p(sym("Foo"), sym("Bar")));

    Print(Eval(Read("foo"))).assert("foo");
    Print(Eval(Read("'foo"))).assert("'foo");
    Print(Eval(Read("123"))).assert("123");
    Print(Eval(Read("true"))).assert("true");
    Print(Eval(Read("false"))).assert("false");
    Print(Eval(Read("(foo . bar)"))).assert("(foo 
    . bar)");
    Print(Eval(Read("(foo bar)"))).assert("(foo . (bar . nil))");

    Print(Eval(Read('(eq? foo bar)'))).assert("false");
    Print(Eval(Read('(eq? foo foo)'))).assert("true");
    Print(Eval(Read('(eq? (foo) foo)'))).assert("false");
    Print(Eval(Read('(eq? (foo) (foo))'))).assert("true");

    // todo ((foo . nil) . ((bar . nil) . nil)) evaluiert noch zu 
    // => ((foo . nil) . nil)

    (define a (lambda (foo) (plus foo 4)))
    (define f (lambda (input) (if (eq? input 42) "Hey, the number is fourtytwo!" "lame number")))

    // test for closures
    (((lambda (foo) (lambda (bar) (plus foo bar))) 5) 5)
        
        
    // test for tail call optimization
    (define test (lambda (i)
      (if (gt? i 0)
        (test (- i 1))
        "Finished test"
      )
    )) 
    
    */
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
                 LISP.true );
                 
    test_parser( "false", 
                 LISP.false );
                 
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
        
})();
