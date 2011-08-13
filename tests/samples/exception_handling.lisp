; (try 
;   (begin
;    ...
;   )
;  
; (catch E1)
; (catch E2))
;
; has to be rewritten to
;
; (try
;   (try
;     (begin
;       ...
;     )
;
;   (catch E1))
; (catch E2))

(defmacro throw (exception-type)
  '(throw-exception (quote ,exception-type)))

(defmacro try (try-block . catch-blocks) (begin

  (assert (not (eq? catch-blocks nil)) "You have to provide at least one catch-block")
  
  ; there is only one catch-block
  (if (eq? (cdr catch-blocks) nil)
    (let ( (catch-block (car catch-blocks)) )
      '(let ( (super-throw (if (defined? 'throw-exception) throw-exception (lambda (e) (error (+ "Not caught exception: " e)))))
              (exception nil) )
         (set! exception (call/cc (lambda (throw-exception) ,try-block)))
         (if (eq? exception nil)
            nil ; do nothing
         ;else
            (,catch-block exception))))
   
   ; else - multiple catch-blocks
   '(try 
      (try 
        ,try-block 
        ,(car catch-blocks))
        
      . ,(cdr catch-blocks))
)))


(defmacro catch (catchable body)
  '(lambda (exception) 
     (if (eq? exception (quote ,catchable))
       ,body ; execute body
     ; else
       (super-throw exception)
     )
   )
)

; usage
(try 
  (begin  
    (print "Inner")
    (try
      (throw ExceptionOne)
      
    (catch ExceptionOne
      (print "Caught ExceptionOne")))
  )
    
(catch ExceptionTwo
  (print "Caught ExceptionTwo"))
  
(catch ExceptionThree
  (print "Caught ExceptionThree")))
