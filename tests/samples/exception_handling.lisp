(define try-catch (lambda (try-block catch-block)
  (let ( (exception nil) )
    (set! exception (call/cc try-block))
    (if (eq? exception  nil)
      (print "Nothing") ; do nothing
    ; else
      (catch-block exception)
    )
  )
))



(try-catch
  (lambda (throw)
    (print "inside lambda")
    (throw "My Exception")
    (print "after exception"))
    
  (lambda (e)
    (print (+ "caught exception: " e))))
