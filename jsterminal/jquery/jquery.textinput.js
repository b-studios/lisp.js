(function($) {

  $.fn.methods = function() {  
    for(method in this)
      console.log(method);
  };

  $.fn.toggleSelection = function(){
    return $(this).each(function(i,el) {   
      el = $(el);
      el[0].selected = !el[0].selected;
      el[0].checked = !el[0].checked;
      el.trigger('refresh');
      el.trigger('change');
    });
  }
  $.fn.setSelection = function(value) {
    return $(this).each(function(i,el) {   
      el = $(el);
      el[0].selected = value;
      el[0].checked = value;
      el.trigger('refresh').trigger('change');
    });
  }

  // @todo what is with keyboard navigation???
  $.fn.replace_input = function(name) {
  
    $(this).each(function(i,el) {
      
      el = $(el);
      var label,
          empty = '[ ] ',
          checked, // [x] or [o]
          replacement = $('<span/>',{
            html: empty
          });
      
      
      function refreshState() {
        if(el.is(':checked'))
          replacement.html(checked);
        else
          replacement.html(empty);
      }
      
      // 1. find label
      if(el.parent().is('label'))
        label = el.parent();
        
      else label = $("label[for='"+el.attr('id')+"']")
      
      // 2. find right checked state:
      if(el.attr('type') == 'radio') checked = '[o] ';      
      else if(el.attr('type') == 'checkbox') checked = '[x] ';
      
      // 3. hide input and show replacement
      el.hide();
      label.prepend(replacement);            
      
      // 4. add events for focus and blur
      el.focus(function(){ label.addClass('focus'); });
      el.blur(function(){ label.removeClass('focus'); });
      
      label.click(refreshState);
      el.bind('refresh', refreshState);
      el.change(function() {      
        // if it is a radio, we have to trigger refresh on all radios of this
        // radiogroup
        if(el.attr('type') == 'radio' && el != $(this)) {
          $("input[type=radio][name='"+el.attr('name')+"']").trigger("refresh");
        }      
      });
      
      refreshState();
    });  
  };

})(jQuery);
