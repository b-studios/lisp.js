// IE fix
if(!(typeof String.prototype.trim == 'function')) {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}


/**
 * @constructor Parser
 */ 
var Parser = function(string) {    
  
  var whitespaces = ["\n","\t"," "];
  
  
  
  // Create a StringScanner from Input    
  var scanner = StringScanner(string.trim());
  
  function read() {    
    // End of File
    if(scanner.peek() === undefined) 
      throw("Unsuspected end of File at Position " + scanner.position());
    
    // Skip over Whitespaces
    scanner.skip();
    
    if(scanner.peekEquals("'"))
      return readQuoted();
      
    if(scanner.peekEquals(","))
      return readBackquote();
    
    if(scanner.peekEquals('"'))
      return readString();
    
    if(scanner.peekEquals('('))
      return readList();
   
    if(scanner.peekEquals(";"))
      return skipComment();
    
    else return readAtom();
  }
      
  
  // @private helper functions
  function skipComment() {
    scanner.until("\n");
    return read();
  }
  
  // stimmt noch nicht ganz!!!
  function readQuoted() {
    scanner.consume("'");
    // Werden Listen mit Quote nicht auch gequoted?? So wie '(list . foo)
    //var quoteValue = scanner.until(['(',')'].concat(whitespaces));
    return new LISP.Quoted(read());
  }
  
  function readBackquote() {
    scanner.consume(",");    
    var breakingChars = ['(',')'].concat(whitespaces);        
    var value = scanner.until(breakingChars);
     
    return new LISP.BackQuote(value);  
  }
  
  function readString() {
    var stringValue = scanner.consume('"').until('"');    
    scanner.consume('"');
    return new LISP.String(stringValue);
  }
  
  function readList() {
    scanner.consume('(');
    
    // it's an empty list
    if(scanner.peekEquals(')')) {
      scanner.consume(')');
      return new LISP.Pair(LISP.nil, LISP.nil);
    }
    return readListRest();
  }

  function readListRest() {
    
    var first = read();      
    
    scanner.skip();
    
    if(scanner.peekEquals('.')) {
      scanner.consume('.');
      return new LISP.Pair(first, readPairRest());
    
    } else if(scanner.peekEquals(')')) {
      // closing list
      scanner.skip().consume(')');
      var rest = LISP.nil;
      
    } else {
      var rest = readListRest();
    }
    return new LISP.Pair(first, rest)
  }
  
  function readPairRest() {
    scanner.skip();
    var rest = read();
    scanner.consume(')');
    return rest;
  }
  
  function readAtom() {  
    // Everything except whitespaces and ( )
    var breakingChars = ['(',')'].concat(whitespaces);        
    var atom = scanner.until(breakingChars); 
      
    // Einfacher mit Regexp
    if(atom.match(/^(\d+)|(\d+\.\d*)|(\d*\.\d+)$/))
      return new LISP.Number(atom);
      
    else if(atom.match(/nil/))
      return LISP.nil;
      
    else if(atom.match(/true/))
      return LISP.True;
    
    else if(atom.match(/false/))
      return LISP.False;
      
    else if(atom.match(/nil/))
      return LISP.nil;
      
    // @todo rewrite to allow symbols like +
    else if(atom.match(/[^\s\(\)\,]+/))
      return new LISP.Symbol(atom);
      
    else throw "Atom: Could not find right type for '"+ atom +"'";    
  }

  return {
    
    read: read,
    
    eos: function() {
      return scanner.peek() === undefined;
    }
  
  };    
};
