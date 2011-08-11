First of all, check it out [here](http://lisp.b-studios.de).
  
  - [Builtins](https://github.com/b-studios/lisp.js/wiki/Builtin-Functions)
  - [Console commands](https://github.com/b-studios/lisp.js/wiki/Commands)

Target
------
The target of this interpreter was to get in touch with building interpreters and 
to learn some lisp. Lisp.js consists of two major parts:

  1. The interpreter
  2. The [console](https://github.com/b-studios/lisp.js/wiki/Jsconsole)

The interpreter itself is splitted into 

  - stringscanner
  - parser
  - interpreter

lisp.js contains the interpreter-objects like `LISP.Number`, `LISP.nil` or `LISP.Continuation`.


Features of the interpreter
---------------------------
- closures
- lambdas with variable argument length 
- lambdas, let and define (lambda-short-syntax) can contain multiple bodies
- features to work with environments (`get-bindings` and `eval`)
- continuations (The interpreter is implemented in Continuation Passing Style CPS)
- tail-call-optimization through the use of trampolines
- call/cc
- cooperative multitasking by using continuations
- all calculations work with multiple arguments
- pretty printing for lists
- quotes with backquoting
- macrodefinition and macroexpansion
- string splitting, joining and conversion from and to symbols


Features of the console
-----------------------
- command history
- editor mode
- console commands
- webworkers
- autocompletion for builtins

There is an abstraction layer, which makes it possible to switch between webworkers and direct mode.
To turn off webworker type `:worker false`. If your browser doesn't support webworkers `:worker true`
won't affect anything.

The cooperative multitasking is made for the browsers, which don't support webworkers. While calculating
the interpreter will otherwise freeze your GUI. So continuations are used to stop processing from time 
to time, so your GUI can be kept updated.

To check which features are used, just type `(system)`, which is a lisp.js builtin function.

How to run lisp.js
------------------
Basically you don't need a webserver to run lisp.js. The tests (contained in the
`tests` folder) will also work locally on your machine. But using jsconsole and
webworkers it is impossible, due to security reasons, that your browser will run
lisp.js correctly.

So there are two ways to try lisp.js

  1. Use the [online-demo](http://lisp.b-studios.de)
  2. Setup a small server on your machine and point your browser to `127.0.0.1`


Testing
-------
The major functionality of the interpreter is tested with qunit. To run the tests
in your browser, navigate to [http://lisp.b-studios.de/tests](http://lisp.b-studios.de/tests)
Running the tests may take a while, because the tail-call-optimization is tested for stack overflows.

The tests (resources can be seen here at github) will also give you a brief overview of
what can be done with lisp.js

lisp.js is tested in Firefox 5, Chrome 13 and Internet Explorer 8/9 (though there are some layout and usability issues in IE)
