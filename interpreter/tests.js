
    /*

    Object.prototype.assert = function(assertion) {  

      if(this instanceof LISP.Pair && assertion instanceof LISP.Pair) {
        this.first().assert(assertion.first());
        this.rest().assert(assertion.rest());
      } else if(this.value == undefined || assertion.value == undefined || this.value != assertion.value) {
        console.error("supposed to be the same", this, assertion);
      }
    };

    // helpers
      var p = function(a,b) { return new LISP.Pair(a,b) },
          sym = function(v) { return new LISP.Symbol(v); },
          s = function(v) { return new LISP.String(v); },
          i = function(v) { return new LISP.Number(v); };

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
    Print(Eval(Read("(foo . bar)"))).assert("(foo . bar)");
    Print(Eval(Read("(foo bar)"))).assert("(foo . (bar . nil))");

    Print(Eval(Read('(eq? foo bar)'))).assert("false");
    Print(Eval(Read('(eq? foo foo)'))).assert("true");
    Print(Eval(Read('(eq? (foo) foo)'))).assert("false");
    Print(Eval(Read('(eq? (foo) (foo))'))).assert("true");

    // todo ((foo . nil) . ((bar . nil) . nil)) evaluiert noch zu 
    // => ((foo . nil) . nil)

    (define a (lambda (foo) (plus foo 4)))
    (define f (lambda (input) (if (eq? input 42) "Hey, the number is fourtytwo!" "lame number")))

    (((lambda (foo) 
      (lambda (bar) 
        (plus foo bar))) 5) 5)
    */
