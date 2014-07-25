class ThinkupInstallerController extends KDController
  app                     = "thinkup"
  appName                 = "Thinkup"
  user                    = KD.nick()
  github                  = "https://rest.kd.io/bvallelunga/#{appName}.kdapp/master"
  existingFile            = "/home/#{user}/Web/#{app}"
  session                 = (Math.random() + 1).toString(36).substring 7
  outPath                 = "/tmp/_#{appName}Installer.out/#{session}"
  [NOT_INSTALLED, INSTALLED, WORKING,
  FAILED, WRONG_PASSWORD, INSTALL,
  REINSTALL, UNINSTALL]   = [0..7]
  
  constructor:(options = {}, data)->

    {thinkupInstallerController} = KD.singletons
    return thinkupInstallerController if thinkupInstallerController

    super options, data

    @kiteHelper = new KiteHelper
    @kiteHelper.ready @bound "configureWatcher"
    @registerSingleton "thinkupInstallerController", this, yes
  
  announce:(message, state, percentage)->
    @updateState state if state
    @emit "status-update", message, percentage 
  
  init: ->
    @kiteHelper.getKite().then (kite)=>
      kite.fsExists(path: existingFile).then (state)=>
        unless state
          @announce "#{appName} Not Installed", NOT_INSTALLED
        else
          @announce "#{appName} Is Installed", INSTALLED

  command: (command, password)->
    switch command
      when INSTALL then name = "install"
      when REINSTALL then name = "reinstall"
      when UNINSTALL then name = "uninstall"
      else return throw "Command: #{command} not registered."
    
    @announce "#{@namify name}ing #{appName}..."
    @watcher.watch()
    
    @kiteHelper.run
      command: "wget -O - #{github}/scripts/#{name}.sh | bash #{user} #{outPath}"
      password: password
    , (err, res)=>
      @watcher.stopWatching()
    
      if err or not state
        @announce "Failed to #{name}, please try again", FAILED
      else if state.exitStatus != 0 and state.stderr.indexOf("incorrect password attempt") != -1 
        @announce "Your password was incorrect, please try again", WRONG_PASSWORD
      else
        @init()

  configureWatcher: ->
    @watcher = new FSWatcher path : outPath
    @watcher.fileAdded = (change)=>
      {name} = change.file
      [percentage, status] = change.file.name.split '-'
      @announce status, WORKING, percentage
      
  
  updateState: (state)->
    @lastState = @state
    @state = state
    
  namify: (name)->
    return (name.split(/\s+/).map (word) -> word[0].toUpperCase() + word[1..-1].toLowerCase()).join ' '
