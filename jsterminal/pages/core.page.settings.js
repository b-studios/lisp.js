// TODO Automatically load environment on start

Core.page("settings", function(menu){

  var dom = $("#page-settings");
  
  
  function flash(msg) {
      dom.find('.flash:first').hide().html(msg)
         .fadeIn(50).delay(1500).fadeOut(50);
    }
    
  function toggleSetting(id, title) {
  
    var full_id = '#settings_'+id,
        el = dom.find(full_id);
  
    // bind change event to checkbox
    el.change(function() {
      Core.settings.set(id, el.is(':checked'));
    });
  
    return Core.command(title, function() { el.toggleSelection(); });      
  };
  
  function applyEnvironment(env) {
    var source = env || $('#settings_environment').val();
    Interpreter.read_all(source);
    flash('Environment applied! Switch back to console, to see output (ESC)');
  }
  
  function saveEnvironment() {
    var source = $('#settings_environment').val();
    Core.settings.set('environment', source);
  }
  
  
  
  function initialize() {
    dom.hide(); 
    
    if(Core.settings.get('auto_env'))
      applyEnvironment(Core.settings.get('environment'));
    
    commands = {      
      abort: Core.command('< Back', Core.pages.interpreter),
      
      clear_history: Core.command('Clear Command History', function(){
        $(document.body).trigger('console::clear_history');
        flash('History successfully cleared!');
      }),
      
      apply_env: Core.command('Apply Environment', applyEnvironment)      
      
    }
    
    // bind events to textarea and button
    $('#settings_apply_env').click(applyEnvironment);
    $('#settings_environment').change(saveEnvironment);
    
    menu.addItem(commands.abort, "ESC", true);
    menu.addItem(commands.clear_history, "F9", true);
    
    menu.addItem(toggleSetting('browser_console', "Use Console as Output"), "F5");
    menu.addItem(toggleSetting('editor_mode', "Work in Editor-Mode"), "F6");
    menu.addItem(toggleSetting('auto_env', "Automatically load environment on start"), "F7");
    menu.addItem(commands.apply_env, "F8");    
  }

  return {
    init: initialize,    
    show: function() {
      
      // load settings and apply to checkboxes   
      $('#settings_browser_console').setSelection(Core.settings.get('browser_console'));
      $('#settings_editor_mode').setSelection(Core.settings.get('editor_mode'));
      $('#settings_auto_env').setSelection(Core.settings.get('auto_env'));
      $('#settings_environment').val(Core.settings.get('environment'));
    
      dom.show();
    },
    hide: function() {
      dom.hide();
    },
    title: "Settings"
  };
});
