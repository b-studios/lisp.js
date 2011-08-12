(defmacro throw (exception-type)
  '(throw-exception (quote ,exception-type)))

(defmacro try (try-block catch-block)

  ; try muss sich das äußere environment merken, um dort 'throw' aufzurufen, wenn die Exception nicht gefangen werden kann
  '(let ( (super-throw (if (defined? 'throw-exception) throw-exception (lambda (e) (error (+ "Not caught exception: " e)))))
          (exception nil) )
     (set! exception (call/cc (lambda (throw-exception) ,try-block)))
     (if (eq? exception nil)
        nil ; do nothing
     ;else
        (,catch-block exception))))     


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
      (throw Exception)
    (catch Exception
      (print "Caught"))
    ) 
  )
(catch ExceptionTwo
  (print "Caught ExceptionTwo")
))
    
