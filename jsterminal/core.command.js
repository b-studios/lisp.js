Core.extend("command", function() {

  return function(title, function_or_page) {
    
    return {
      do: function() {
      
        if(function_or_page instanceof Function)
          function_or_page();
          
        // it has to be a page
        else Core.dispatcher.open(function_or_page);
      },
      
      title: title
    };  
  };
});
