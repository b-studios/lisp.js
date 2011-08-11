Features
========
- closures
- lambdas mit variable argument list
- lambdas, let und define (lambda) schließen implizit ein begin ein
- get-bindings und eval
- continuations
- tco durch trampolining
- call/cc
- cooperative multitasking oder webworkers
- all calculations work with multiple arguments
- list pretty printing
- macroexpansion with backquoting
- string splitting, joining and conversion from and to symbols

- own OO implementation for demonstration


Builtins
========

### assert CONDITION MSG #
Throws an exception containing MSG if CONDITION evaluates to `false`.

    (assert false "My Exception")
    ; ERROR: My Exception


List Manipulation
-----------------

### cons FIRST REST #
Creates a new Lisp-Pair with the two elements FIRST and REST

    (cons 123 456) 
    ;-> (123 . 456)

### car PAIR #
Retreives first element of Pair

    (car (1 . 2)) 
    ;-> 1

### cdr PAIR #
Retreives last element of Pair

    (cdr (1 . 2)) 
    ;-> 2

Quote and Eval
--------------

### quote SOMETHING #
Just returns the first argument, without evaluating it.

    (quote Foo)
    ;-> Foo

### get-bindings #
Returns the current binding (= LISP.Environment)

    (get-bindings)
    ;-> <Environment>

    (eval 'n ((lambda (n) (get-bindings)) 2))
    ;-> 2

### eval LIST ENV? #
Evals the given LIST. If the optional parameter ENV is given, this environment
is used to eval LIST.
    
    (define my_env ((lambda (foo) (get-bindings)) 4))
    (eval '(+ foo 1) my_env)
    ;-> 5


Mathematical Operators
----------------------
There are a bunch of mathematical operators. All of them can be used with a variable
number of arguments (i.e. `(+ 1 2 3 4 5 6)` is supported).

### + ARG1 ARGS* #
### - ARG1 ARGS* #
### * ARG1 ARGS* #
### / ARG1 ARGS* #
### % ARG1 ARGS* #


Logical Operators
-----------------
Again there are a few logical operators, which can be used to work on logical
expressions like `(not (and true false))`
One may note, that the current implementation evaluates both arguments all the
time. When using `(and (expr1) (expr2))` both expressions are evaluated before 
comparison.

### and ARG1 ARG2 #
### or ARG1 ARG2 #
### xor ARG1 ARG2 #
### not ARG1 ARG2 #


Comparators
-----------
All Comparators, except `eq?` are built to work with Numbers.

### eq? ARG1 ARG2 #
Evaluates both arguments and compares them afterwards. At first the types are
checked for equality. Then the values of both arguments are compared.
Lists are compared recursive.

    (eq? 4 4)
    ;-> true
    
    (eq? "Foo" "Foo")
    ;-> true
    
    (eq? '(1 2 3) '(1 2 3))
    ;-> true

    (eq? '(1 2) '(1 2 3))
    ;-> false
    
### gt? ARG1 ARG2 #
Greater than. (>)

    (gt? 5 4)
    ;-> true
    
    (gt? 5 5)
    ;-> false

### ge? ARG1 ARG2 #
Greater than, or equal. (>=)

    (ge? 5 4)
    ;-> true
    
    (ge? 5 5)
    ;-> true
    
### lt? ARG1 ARG2 #
Less than. (<)

### le? ARG1 ARG2 #
Less than, or equal. (<=)


Environment Manipulation
------------------------

### define KEY VALUE #
Defines KEY (which has to be a symbol) as VALUE in the current environment.

    (define foo 1)
    foo
    ;-> 1
    
### define (KEY ARGS* . VARARGS?) BODY+ #
Shorthand for `(define SYMBOL (lambda (args) body))`. As with `lambda`, `let` and
`begin` define can take multiple bodies, which are evaluated one after another on
execution.

    (define (say_hello name)
       (print "Hello!")
       (print name))
       
    (say_hello "Mister")
    ; "Hello"
    ; "Mister"
    ;-> nil

### defined? KEY #
Returns `true` if KEY is defined in the current environment - otherwise `false` is
returned.

    (define foo 4)
    (defined? foo)
    ;-> true
    
    (defined? bar)
    ;-> false

### set! KEY VALUE #
Changes the defined value of KEY to VALUE. (KEY has to be already defined 
somewhere in the environment chain!!)

    (define foo 4)
    (set! foo 7)
    foo
    ;-> 7
    
    (set! bar 8)
    ; ERROR: bar is not defined, and cannot be set to 8

### let ( (KEY VALUE)* ) BODY+ #
A new temporary environment is created and for each key-value pair VALUE is bound
to the KEY. Afterwards all bodies are evaluated in this environment and the last
return-value is returned.

    (let ( (Foo 3)
           (Bar 2) )
      (+ Foo Bar))
    ;-> 5
    
### reset #
Clears the global environment and resets it. Afterwards only the builtins are
defined.

    (define Foo 5)
    (reset)
    
    (defined? Foo)
    ;-> false
    
    (defined? +)
    ;-> true


Strings and Symbols
-------------------
To make it possible to work with string and convert them from / to symbols the following
methods are available

### to_s SYMBOL #
Converts a symbol (or anything, that's got a value) to a string

### to_sym STRING #
Converts a string (or anything, that's got a value) to a symbol.

### split STRING #
Splits a string into a list of characters:

    (split "Hello World")
    ;-> '("H" "e" "l" "l" "o" " " "W" "o" "r" "l" "d")
    
### join LIST #
Joins a list back to a string

    (join '("H" "e" "l" "l" "o" " " "W" "o" "r" "l" "d"))
    ;-> "Hello World"


Introspection
-------------

### typeof ELEMENT #
Returns a symbol, which describes the type of the ELEMENT.

    (typeof 123)
    ;-> 'Number
    
    (typeof 'Foo)
    ;-> 'Symbol

    
Program Flow
------------

Working Examples
================
    (defmacro defun (name args body) 
      '(define ,(cons name args) ,body))

    (defun else (body) 
      body)
    (define elsif if)  

    (defun pair? (item)
      (eq? (typeof item) "Pair"))

    (defun nil? (item)
      (eq? item nil))
    
    (defmacro NTH (n)

    ; we want (car . ((cdr . ('innerst . nil)) . nil))
    ; (cons 'car (cons (cons 'cdr (cons 'innerst nil)) nil))

      (begin
        (define (helper m innerst)

          (if (eq? m 0)
            innerst

          ;else
            (cons 'cdr (cons (helper (- m 1) innerst) nil))))
         
        '(lambda (lst) ,(cons 'car (cons (helper (- n 1) 'lst) nil)))
       )
    )

    (define first (NTH 1))
    (define second (NTH 2))
    (define third (NTH 3))
    (define fourth (NTH 4))
    (define fifth (NTH 5))
    (define sixth (NTH 6))
    (define seventh (NTH 7))


    (define Hash (lambda ()
      (define env (empty-binding true))
      (lambda (sym . args)

        ; get
        (if (eq? sym 'get)
          (let ((key (car args)))
            (eval key env))
        
        ; set
        (if (eq? sym 'set)
          (let ((key (car args))
                (val (car (cdr args))))
              (eval '(define ,key ,val) env))
              
        ; defined?
        (if (eq? sym 'defined?)
          (let ((key (car args)))
              (eval '(defined? (quote ,key)) env))
        
        ; get-binding
        (if (eq? sym 'get-binding)
          env
        
        ; else
        (error (+ "Method '" sym "' not defined"))
        
        )))))))
     
     
     
     
    (define (each lst method)
      (if (eq? lst nil)
        nil
      ;else
        (begin
          (method (car lst))
          (each (cdr lst) method))))


    (define (clone-bindings old-bindings)
      (eval '((lambda () (get-bindings))) old-bindings))

    (defmacro class (classname . class-definitions)
      
      ; those are shared by all instances
      (let ( (instance-methods (empty-binding true))
             (class-methods    (empty-binding true))
             (class-variables  (empty-binding true)) )
        
        ; add some instance methods
        (eval
          '(begin
             ; we quote it, because it should be defined in instance-environment
             (defmacro def (name args body)
               '(define ,name (quote (lambda ,args ,body))))
               
        ) instance-methods)
        
        ; add some class methods
        (eval 
          '(begin
               
             ; this is our instance definition
             (define new (lambda args
             
                ; create room for instance-variables and copy instance-methods
                (let ( (instance-variables (empty-binding true))
                       (instance-methods   (clone-bindings ,instance-methods)) )
                  
                  ; add instance methods to access instance-variables
                  ; PROBLEM those methods are currently still shared between all instances
                  (eval
                    '(begin
                       (define (instance-variable-get name)
                         (eval name ,instance-variables))
                         
                       (define (instance-variable-set name value)
                         (eval '(define ,name ,value) ,instance-variables))
                         
                  ) instance-methods)
                 
                  ; this is our instance
                  (lambda (sym . args)

                    ; check if symbol is defined      
                    (if (not (eval '(defined? (quote ,sym)) instance-methods))
                      (error (+ "Method '" sym "' not defined"))
                                  
                    ; else double evaluate, because it's quoted
                      (eval '(,(eval sym instance-methods) . ,args) instance-methods)
                    ))
                )
             ))
           )
        class-methods)   
        
        (each class-definitions (lambda (def)
          (eval def instance-methods)
        ))
        
        ; return
        '(define ,classname (lambda (sym . args)

          ; check if symbol is defined      
          (if (not (eval '(defined? (quote ,sym)) ,class-methods))
            (error (+ "Method '" sym "' not defined"))
                        
          ; else
            (eval '(,sym . ,args) ,class-methods)
          )))
       )
    )

    (class Person

      ;implement getter and setter for name
      (def name= (name)
        (instance-variable-set 'name name))

      (def name ()
        (instance-variable-get 'name))



      (def say_hello ()
        (print (+ "Hello, says " (instance-variable-get 'name))))
        
      (def say_hello_to (other_person)
        (print (+ "Hello " (other_person 'name))))

      (def say_bye (name bye)
        (print (+ bye " " name ", says " (instance-variable-get 'name))))
        
      (def just_do_something ()
        (print "something"))
        
    )

    (define jona (Person 'new))
    (jona 'name= "Jonathan Brachthäuser")
    (jona 'say_hello) 

    (define marlen (Person 'new))
    (marlen 'name= "Marlen Luise")
    (marlen 'say_hello)

    (jona 'say_hello) 

    (jona 'say_hello_to marlen)
