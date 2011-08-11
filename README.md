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


Builtins
========


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
