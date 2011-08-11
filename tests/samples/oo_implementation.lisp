(define (each lst method)
  (if (eq? lst nil)
    nil
  ;else
    (begin
      (method (car lst))
      (each (cdr lst) method))))


(define (clone-bindings old-bindings)
  (eval '((lambda () (get-bindings))) old-bindings))

(define new-bindings (lambda () (get-bindings)))

(defmacro class arguments 
  
  ; those are shared by all instances
  (let ( (instance-methods (new-bindings))
         (class-methods    (new-bindings))
         (class-variables  (new-bindings))
         
         (class-name       (car arguments))
         (class-definitions          nil) 
         (super                      nil) )
    
    ; detect syntax
    ; (class Foo < Bar (
    (if (eq? (car (cdr arguments)) '<) 
      (begin
      ; change bindings and class definitions      
        
        (set! class-definitions (cdr (cdr (cdr arguments))))
        (set! super (eval (car (cdr (cdr arguments)))))
        
        (set! instance-methods (clone-bindings (car (super 'bindings))))
        (set! class-methods (clone-bindings (cdr (super 'bindings))))
      )
    
    ; else - only change class definitions
    ; (class Foo (
      (set! class-definitions (cdr arguments))
    )
  
    ; add some instance methods
    (eval
      '(begin
         ; we wrap it into a eval self to get the lambda into the right closure
         (defmacro def (name args . body)
          '(define ,name (lambda (self call_args)
          
            ; eval lambda in self environment
            (let ( (method      (eval (quote (lambda ,args . ,body)) self))
                   (arguments   call_args) )
                       
              ; then execute lambda in self env
              (eval '(,method . ,arguments) self)              
            ))))
             
         ; empty constructor
         (def initialize () nil)
         
         ; attr-reader
         (defmacro attr-reader (attr)
             '(def ,attr () (instance-variable-get (quote ,attr))))
             
         ; attr-accessor
         (defmacro attr-accessor (attr)
             '(begin
                (def ,attr () (instance-variable-get (quote ,attr)))
                (def ,(to_sym (+ (to_s attr) "=")) (,attr) (instance-variable-set (quote ,attr) ,attr))
              ))
    ) instance-methods)
    
    ; add some class methods
    (eval 
      '(begin
         
         ; this is our instance definition
         ; new
         (define new (lambda args
         
            ; create room for instance-variables and copy instance-methods
            (let ( (instance-variables (new-bindings))
                   (instance-methods   (clone-bindings ,instance-methods)) )
              
              ; resolve symbol in instance method, then call method with (environment . args)
              (define (instance-eval symbol arguments)
                (eval '(,symbol (quote ,instance-methods) (quote ,arguments)) instance-methods)
              )
                                          
              ; add instance methods to access instance-variables
              (eval
                '(begin
                   (define (instance-variable-get name)
                     (eval name ,instance-variables))
                     
                   (define (instance-variable-set name value)
                     (eval '(define ,name ,value) ,instance-variables))
                     
              ) instance-methods)
              
              ; now execute constructor!
              (instance-eval 'initialize args)
              
              ; this is our instance
              (lambda (sym . args)

                ; check if symbol is defined      
                (if (not (eval '(defined? (quote ,sym)) instance-methods))
                  (error (+ "Method '" sym "' not defined"))
                              
                ; get lambda from instance-methods and call it with environment and args
                  (instance-eval sym args)
                ))
            )
         ))
         
         (define bindings (lambda ()
           (cons ,instance-methods ,class-methods)
         ))
         
         (define superclass (lambda () ,super))
       )
    class-methods)   
    
    (each class-definitions (lambda (def)
      (eval def instance-methods)
    ))
    
    ; return
    '(define ,class-name (lambda (sym . args)

      ; check if symbol is defined      
      (if (not (eval '(defined? (quote ,sym)) ,class-methods))
        (error (+ "Method '" sym "' not defined"))
                    
      ; else
        (eval '(,sym . ,args) ,class-methods)
      )))
   )
)

;; --------------------------------- Examples ----------------------------------


(class Person
  
  (attr-accessor name)
  (attr-reader age)

  ; constructor
  (def initialize (name age)
    (instance-variable-set 'name name)
    (instance-variable-set 'age age)
  )


  (def say_hello ()
    (print (+ "Hello, my name is " 
              (instance-variable-get 'name)
              " and i am "
              (instance-variable-get 'age)
              " years old."))
  )
    
  (def say_hello_to (other_person)
    (print (+ "Hello " (other_person 'name))))

  (def say_bye (name bye)
    (print (+ bye " " name ", says " (instance-variable-get 'name))))
    
  (def just_do_something ()
    (print "something"))
    
)

(class Student < Person
  
  (attr-reader matrikelnr)
  
  ; constructor
  (def initialize (name age matrikelnr)
    (instance-variable-set 'name name)
    (instance-variable-set 'age age)
    (instance-variable-set 'matrikelnr matrikelnr)
  )
  
  (def say_hello ()
    (print (+ "Hello, i'm a Student - my name is " 
              (instance-variable-get 'name)
              " and my matrikelnr is "
              (instance-variable-get 'matrikelnr)
            ))
  )
)

(define jona (Person 'new "Jonathan" 25)) 

(define homer (Person 'new "Homer Simpson" 22))

(define jona_stud (Student 'new "Jonathan" 25 12055))

(jona 'say_hello) 
(homer 'say_hello)
(jona 'say_hello_to homer)
(jona_stud 'say_hello)
(jona_stud 'say_hello_to homer)
(homer 'say_hello_to jona_stud)

; Use the accessor
(jona 'name= "Fudel")
(jona 'say_hello)
