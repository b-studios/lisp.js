; some required helper-functions
(define first car)
(define rest cdr)
(define (last lst)
  (if (eq? lst nil)
     nil
  
  (if (eq? (cdr lst) nil)
    (car lst)
  ; else
  (last (cdr lst)))))

(define (pair? n) (eq? (typeof n) 'Pair))



;
; PEANO-Zahlen Implementation by Benjamin Thaut
;
(define null nil)
(define _0 null)
(define (SUCC x) (cons null x))
(define (PRED x) (rest x))
(define _1 (SUCC _0))
(define _2 (SUCC _1))
(define _3 (SUCC _2))
(define _4 (SUCC _3))
(define _5 (SUCC _4))
(define _6 (SUCC _5))
(define _7 (SUCC _6))
(define _8 (SUCC _7))
(define _9 (SUCC _8))
(define _10 (SUCC _9))

(define (EQ_NAT? a b)
  (if (eq? a _0)
      (eq? b _0)   
      (if (eq? b _0)
          false
          ;else
          (EQ_NAT? (PRED a) (PRED b))
       )
   )
)

(define (LT_NAT? a b)
  (if (eq? a _0)
      (not (eq? b _0))
      ;else
      (if (eq? b _0)
          false
          (LT_NAT? (PRED a) (PRED b))
      )
  )
)

(define (GT_NAT? a b) (LT_NAT? b a))

(define (LE_NAT? a b) (not (GT_NAT? a b)))

(define (GE_NAT? a b) (LE_NAT? b a))

(define (ADD_NAT a b)
  (if (eq? b _0)
      a
      ;else
      (ADD_NAT (SUCC a) (PRED b))
  )
)

(define (SUB_NAT a b)
  (if (eq? b _0)
      a
      ;else
      (SUB_NAT (PRED a) (PRED b))
  )
)

(define (MUL_NAT a b)
  (if (or (eq? a _0) (eq? b _0))
      _0
      ;else
      (if (EQ_NAT? b _1)
          a
          ;else
          (ADD_NAT (MUL_NAT a (PRED b)) a)
      )
  )
)

(define (DIV_NAT a b)
  (if (eq? b _0)
      (print "division by zero")
      (if (LT_NAT? a b)
          _0
          ;else
          (SUCC (DIV_NAT (SUB_NAT a b) b))
      )
  )
)

(define (MOD_NAT a b)
  (if (eq? b _0)
      (print "modulo by zero")
      (if (LT_NAT? a b)
          a
          ;else
          (MOD_NAT (SUB_NAT a b) b)
      )
  )
)

(define (PRINT_NAT a)
  (if (EQ_NAT? a _0)
      (print 0)
  (if (EQ_NAT? a _1)
      (print 1)
  (if (EQ_NAT? a _2)
      (print 2)
  (if (EQ_NAT? a _3)
      (print 3)
  (if (EQ_NAT? a _4)
      (print 4)
  (if (EQ_NAT? a _5)
      (print 5)
  (if (EQ_NAT? a _6)
      (print 6)
  (if (EQ_NAT? a _7)
      (print 7)
  (if (EQ_NAT? a _8)
      (print 8)
  (if (EQ_NAT? a _9)
      (print 9)   
      ;else
      (begin
        (PRINT_NAT (DIV_NAT a _10))
        (PRINT_NAT (MOD_NAT a _10))
      )
  ))))))))))
)

(define (POW_NAT a b)
  (if (eq? b _0)
      _1
      ;else
      (MUL_NAT (POW_NAT a (PRED b)) a)
  )
)

(define (INT sign value)
  (if (not (or (eq? sign '+) (eq? sign '-)))
      (print "invalid sign")
      ;else
      (if (eq? value _0)
          (cons 'INTEGER (cons '+ (cons value null)))
          ;else
          (cons 'INTEGER (cons sign (cons value null)))
      )
  )
)

(define p_0 (INT '+ _0))
(define p_1 (INT '+ _1))
(define p_2 (INT '+ _2))
(define p_3 (INT '+ _3))
(define p_4 (INT '+ _4))
(define p_5 (INT '+ _5))
(define p_6 (INT '+ _6))
(define p_7 (INT '+ _7))
(define p_8 (INT '+ _8))
(define p_9 (INT '+ _9))
(define p_10 (INT '+ _10))

(define n_1 (INT '- _1))
(define n_2 (INT '- _2))
(define n_3 (INT '- _3))
(define n_4 (INT '- _4))
(define n_5 (INT '- _5))
(define n_6 (INT '- _6))
(define n_7 (INT '- _7))
(define n_8 (INT '- _8))
(define n_9 (INT '- _9))
(define n_10 (INT '- _10))

(define (INT? value)
  (if (pair? value)
      (if (eq? (first value) 'INTEGER)
          true
          ;else
          false
      )
      ;else
      false
  )
)

(define (PRINT_INT a)
  (if (eq? (first (rest a)) '+)
      (print '+)
      
      (print '-)
  )
  (PRINT_NAT (last a))
)
      
(define (ADD_INT a b)
  (if (eq? (first (rest a)) (first (rest b)))
      (INT (first (rest a)) (ADD_NAT (last a) (last b)))
      
      (if (and (eq? (first (rest a)) '+) (eq? (first (rest b)) '-))
          (if (GE_NAT? (last a) (last b))
              (INT '+ (SUB_NAT (last a) (last b)))
              
              (INT '- (SUB_NAT (last b) (last a)))
          )
          
          (if (GE_NAT? b a)
              (INT '+ (SUB_NAT (last b) (last a)))
              
              (INT '- (SUB_NAT (last a) (last b)))
          )
      )
  )
)

(define (NEG_INT a)
  (if (eq? (first (rest a)) '+)
      (INT '- (last a))
      
      (INT '+ (last a))
  )
)

(define (SUB_INT a b)
  (ADD_INT a (NEG_INT b))
)

(define (EQ_INT? a b)
  (if (and (eq? (first (rest a)) (first (rest b))) (EQ_NAT? (last a) (last b)))
      true
      
      false
  )
)

(define (LT_INT? a b)
  (if (and (eq? (first (rest a)) (first (rest b))))
      (if (eq? (first (rest a)) '+)
          (LT_NAT? (last a) (last b))
          
          (LT_NAT? (last b) (last a))
      )
      
      (if (and (eq? (first (rest a)) '-) (eq? (first (rest b)) '+))
          true
          
          false
      )
  )
)

(define (GT_INT? a b) (LT_INT? b a))

(define (LE_INT? a b) (not (GT_INT? a b)))

(define (GE_INT? a b) (not (LT_INT? a b)))

(define (MUL_INT a b)
  (if (eq? (first (rest a)) (first (rest b)))
      (INT '+ (MUL_NAT (last a) (last b)))
      
      (INT '- (MUL_NAT (last a) (last b)))
  )
)

(define (DIV_INT a b)
  (if (eq? (first (rest a)) (first (rest b)))
      (INT '+ (DIV_NAT (last a) (last b)))
      
      (INT '- (DIV_NAT (last a) (last b)))
  )
)

(define (MOD_INT a b)
  (if (eq? (first (rest a)) (first (rest b)))
      (INT '+ (MOD_NAT (last a) (last b)))
      
      (INT '- (MOD_NAT (last a) (last b)))
  )
)

(define (POW_INT a b)
  (if (EQ_INT? b p_0)
      p_1
      
      (MUL_INT (POW_INT a (SUB_INT b p_1)) a)
  )
)

(define (FLOAT decimal value)
  (if (INT? value)
      (cons 'FLOAT (cons decimal (cons value null)))
      
      (print "value has to be an INTEGER")
  )
)

(define (FLOAT? value)
  (if (pair? value)
      (if (eq? (first value) 'FLOAT)
          true
          
          false
      )
      
      false
  )
)

(define p_0_0 (FLOAT _0 p_0))
(define p_1_0 (FLOAT _0 p_1))
(define p_2_0 (FLOAT _0 p_2))
(define p_3_0 (FLOAT _0 p_3))
(define p_4_0 (FLOAT _0 p_4))
(define p_1_1 (FLOAT _1 (ADD_INT p_10 p_1)))

(define MAX_FLOAT_DECIMALS _3)

(define (OPT_FLOAT a)
  (if (GT_NAT? (first (rest a)) MAX_FLOAT_DECIMALS)
      (OPT_FLOAT (FLOAT (PRED (first (rest a))) (DIV_INT (last a) p_10)))
      a
  )
)

(define (PRINT_FLOAT a)
  (define (print-fill x)
    (if (GT_NAT? x (last (last a)))
        (begin 
          (print 0)
          (print-fill (DIV_NAT x _10))
        )
        
        null
    )
  )
  (define divisor (POW_NAT _10 (first (rest a))))
  (if (eq? (first (rest (last a))) '+)
      (print "+")
      
      (print "-")
  )
  (PRINT_NAT (DIV_NAT (last (last a)) divisor))
  (print ",")
  (define fill (POW_NAT _10 (PRED (first (rest a))) ))
  (if (GT_NAT? fill (last (last a)))
      (print-fill fill)
      
      null
  )
  (PRINT_NAT (MOD_NAT (last (last a)) divisor))
)

(define (MUL_FLOAT a b)
  (define decimal (ADD_NAT (first (rest a)) (first (rest b))))
  (define value (MUL_INT (last a) (last b)))
  (OPT_FLOAT (FLOAT decimal value))
 )



(define (DIV_FLOAT a b)
  (if (or (EQ_INT? (MOD_INT (last a) (last b)) p_0) (LT_NAT? MAX_FLOAT_DECIMALS (first (rest a))))
      (FLOAT (ADD_NAT (first (rest a)) (first (rest b))) (DIV_INT (last a) (last b)))
      
      (DIV_FLOAT (FLOAT (SUCC (first (rest a))) (MUL_INT p_10 (last a))) b)
  )
)
  

(define (ADD_FLOAT a b)
  (if (GE_NAT? (first (rest a)) (first (rest b)))
      (OPT_FLOAT (FLOAT (first (rest a)) (ADD_INT (last a) (MUL_INT (last b) (POW_INT p_10 (INT '+ (SUB_NAT (first (rest a)) (first (rest b)))))))))
      
      (ADD_FLOAT b a)
  )
)

(define (SUB_FLOAT a b)
  (ADD_FLOAT a (FLOAT (first (rest b)) (NEG_INT (last b))))
)

(define (EQ_FLOAT? a b)
  (and (EQ_NAT? (first (rest a)) (first (rest b))) (EQ_INT? (last a) (last b)))
)

(define (LT_FLOAT? a b)
  (if (EQ_NAT? (first (rest a)) (first (rest b)))
      (LT_INT? (last a) (last b))
      
      (if (LT_NAT? (first (rest a)) (first (rest b)))
          (LT_FLOAT? (FLOAT (first (rest b)) (MUL_INT (last a) (POW_INT p_10 (INT '+ (SUB_NAT (first (rest b)) (first (rest a))))))) b)
          
          (LT_FLOAT? a (FLOAT (first (rest a)) (MUL_INT (last b) (POW_INT p_10 (INT '+ (SUB_NAT (first (rest a)) (first (rest b))))))))
      )
  )
)

(define (GT_FLOAT? a b) (LT_FLOAT? b a))

(define (GE_FLOAT? a b) (not (LT_FLOAT? a b)))

(define (LE_FLOAT? a b) (not (LT_FLOAT? b a)))

(define (POW_FLOAT a b)
  (define (pow-helper-nat a b)
    (if (EQ_NAT? b _0)
        p_1_0
        
        (MUL_FLOAT a (POW_FLOAT a (PRED b)))
    )
  )
  (if (FLOAT? b)
      (print "not implemented\n")
      
      (if (INT? b)
          (print "not implemented\n")
          
          (pow-helper-nat a b)
      )
  )   
)

(define (MAKE_OP_2 natFunc intFunc floatFunc)
  (lambda (a b)
    (if (and (FLOAT? a) (not (FLOAT? b)))
        (if (INT? b)
            (floatFunc a (FLOAT _0 b))
            
            (floatFunc a (FLOAT _0 (INT '+ b)))
        )
        
        (if (and (not (FLOAT? a)) (FLOAT? b))
            (if (INT? a)
                (floatFunc (FLOAT _0 a) b)
                
                (floatFunc (FLOAT _0 (INT '+ a)) b)
            )
            
            (if (and (FLOAT? a) (FLOAT? b))
                (floatFunc a b)
                
    (if (and (INT? a) (not (INT? b)))
        (intFunc a (INT '+ b))
        
        (if (and (not (INT? a)) (INT? b))
            (intFunc (INT '+ a) b)
            
            (if (and (INT? a) (INT? b))
                (intFunc a b)
                
                (natFunc a b)
            )
        )
    )
  ))))
)

(define (MAKE_OP_1 natFunc intFunc floatFunc)
  (lambda (a)
    (if (FLOAT? a)
        (floatFunc a)
        
        (if (INT? a)
            (intFunc a)
            
            (natFunc a)
        )
    )
  )
)  

(define ADD (MAKE_OP_2 ADD_NAT ADD_INT ADD_FLOAT))
(define SUB (MAKE_OP_2 SUB_NAT SUB_INT SUB_FLOAT))
(define MUL (MAKE_OP_2 MUL_NAT MUL_INT SUB_FLOAT))
(define DIV (MAKE_OP_2 DIV_NAT DIV_INT DIV_FLOAT))
(define PRINT (MAKE_OP_1 PRINT_NAT PRINT_INT PRINT_FLOAT))
(define EQ? (MAKE_OP_2 EQ_NAT? EQ_INT? EQ_FLOAT?))
(define LT? (MAKE_OP_2 LT_NAT? LT_INT? EQ_FLOAT?))
(define GT? (MAKE_OP_2 GT_NAT? GT_INT? GT_FLOAT?))
(define LE? (MAKE_OP_2 LE_NAT? LE_INT? LE_FLOAT?))
(define GE? (MAKE_OP_2 GE_NAT? GE_INT? GE_FLOAT?))
(define MOD (MAKE_OP_2 MOD_NAT MOD_INT null))

(define (TYPEOF x)
  (if (FLOAT? x)
      'FLOAT
      
      (if (INT? x)
          'INTEGER
          
          'NATUARL
      )
  )
)

(define (FAC a)
  (if (LE? a _1)
      _1
      
      (MUL (FAC (SUB a _1)) a)
  )
)

(define (MAKE_PI steps)
  (define (helper i x op)
    (if (GT_NAT? i _0)
        (if (eq? op '+)
            (ADD_FLOAT (helper (PRED i) (ADD_FLOAT x p_2_0) '-) (DIV_FLOAT p_1_0 x))
            
            (SUB_FLOAT (helper (PRED i) (ADD_FLOAT x p_2_0) '+) (DIV_FLOAT p_1_0 x))
        )
        
        p_1_0
    )
  )
  (MUL_FLOAT (helper steps p_3_0 '-) p_4_0)
)
