class ThinkupInstallerController extends KDController
  
  constructor:(options = {}, data)->

    {thinkupInstallerController} = KD.singletons
    return thinkupInstallerController if thinkupInstallerController

    super options, data

    @kiteHelper = new KiteHelper
    @kiteHelper.ready @bound "configureWatcher"
    @registerSingleton "thinkupInstallerController", this, yes
  
  announce:(message, state, percentage)->
    @updateState state if state?
    @emit "status-update", message, percentage 
  
  init: ->
    @kiteHelper.getKite().then (kite)=>
      kite.fsExists(path: installChecker)
        .then (state)=>
          unless state
            @announce "#{appName} not installed", NOT_INSTALLED
          else
            @announce "#{appName} is installed", INSTALLED
            @configureEmailWatcher()
        .catch (err)=>
            @announce "Failed to see if #{appName} is installed", FAILED
            throw err

  command: (command, password)->
    switch command
      when INSTALL then name = "install"
      when REINSTALL then name = "reinstall"
      when UNINSTALL then name = "uninstall"
      else return throw "Command not registered."
    
    @lastCommand = command
    @announce "#{@namify name}ing #{appName}...", null, 0
    @watcher.watch()
    
    @kiteHelper.run
      command: "curl -sL #{github}/scripts/#{name}.sh | bash -s #{user} #{logger}"
      password: password
    , (err, res)=>
      @watcher.stopWatching()
      
      if not err and res.exitStatus is 0
        @init()
      else
        if err.details.message is "Permissiond denied. Wrong password"
          @announce "Your password was incorrect, please try again", WRONG_PASSWORD
        else
          @announce "Failed to #{name}, please try again", FAILED

  configureWatcher: ->
    @kiteHelper.run 
      command : "mkdir -p #{logger}"
    , (err)=>
      unless err
        @watcher = new FSWatcher
          path : logger
          recursive : no
        @watcher.fileAdded = (change)=>
          {name} = change.file
          [percentage, status] = name.split '-'
          @announce status, WORKING, percentage
      else
        return throw err
        
  configureEmail: ->
    find = "\\$THINKUP_CFG\\['mandrill_api_key'\\] \\= ''"
    replace = "\\$THINKUP_CFG['mandrill_api_key'] = '#{@mandrillKey}'"
    
    @kiteHelper.run
      command : """
        sed -i  "s/#{find}/#{replace}/g" #{configuredChecker};
        mysql -u root --password=#{@mysqlPassword} -e 'USE Thinkup; UPDATE tu_owners SET is_activated=1;'
      """
    , (err)=>
      if err
        console.error err
        @announce "Failed to configure email client, please try again"
  
  configureEmailWatcher: ->
    if @configWatcher
      @configWatcher.stopWatching()
      delete @configWatcher
    
    @configWatcher = new FSWatcher 
      path      : installChecker
      recursive : no
    @configWatcher.fileAdded = (change)=>
      if change.file.name is "config.inc.php"
        @configWatcher.stopWatching()
        @configureEmail()
    @configWatcher.watch()
  
  updateState: (state)->
    @lastState = @state
    @state = state
    
  namify: (name)->
    return (name.split(/\s+/).map (word) -> word[0].toUpperCase() + word[1..-1].toLowerCase()).join ' '

  isConfigured: ->
    new Promise (resolve, reject)=>
      unless configuredChecker
        return resolve yes
      
      @kiteHelper.getKite().then (kite)=>
        kite.fsExists path: configuredChecker
          .then resolve
          .catch reject
            