/**
 * @constructor StringScanner
 */
var StringScanner = function(string) {
  
  var WHITESPACES = ["\n","\t"," "];  
  
  var pos = 0;
  
  // Private Helper Methods
  function matches(pattern) {
  
    var args = null;
        
    // Like matches(["f","o","o"])
    if(arguments.length == 1 && pattern.push !== undefined)
      args = pattern;
    
    // Like matches("f") or matches("f","o","o")
    else args = arguments;
    
    for(var i=0,len=args.length;i<len;i++) {
      if(string[pos] === args[i]) return true;
    }
    return false;  
  };

  function end() {
    return !(pos < string.length);
  };
  
  var scanner = {
  
    peek: function(amount) {
      return string[pos + (amount || 0)];
    },   
     
    next: function() {
      if(pos < string.length)
        return string[pos++];
    },
    
    consume: function(character) {
      if(!matches(character)) {
        throw "Character missmatch at position: " + pos + " while consuming - Expected: " + character + " got " + string[pos];
        return;
      } else scanner.next();     
      
      return scanner;
    },
    
    peekEquals: matches,  
      
    reset: function() {
      pos = 0;      
      return scanner;
    },
    
    // skip Whitespaces
    skip: function() {  
    
      if(arguments.length > 0) 
        var args = arguments;
      else
        var args = WHITESPACES;
        
      while(matches(args)) pos++;
      
      return scanner;
    },
    
    // pattern has to be an array or a string
    until: function(pattern, breakOnEnd) {      
      var begin = pos;
            
      while(!(end() || matches(pattern))) pos++;
      
      if(!breakOnEnd || (!end() && matches(pattern)))
        return string.substring(begin, pos);      
    },
    
    position: function() {
      return pos;
    }
  };  
  
  return scanner;
};
