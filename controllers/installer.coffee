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
        .catch (err)=>
            @announce "Failed to see if #{appName} is installed", FAILED
            console.error err

  command: (command, password, data)->
    switch command
      when INSTALL then name = "install"
      when REINSTALL then name = "reinstall"
      when UNINSTALL then name = "uninstall"
      else return console.error "Command not registered."

    @lastCommand = command
    @announce "#{@namify name}ing #{appName}...", null, 0
    @watcher.watch()

    @kiteHelper.run
      command: "curl -sL #{scripts[name].url} | bash -s #{user} #{logger} #{@mysqlPassword} > #{logger}/../#{name}.out"
      password: if scripts[name].sudo then password else null
    , (err, res)=>
      @watcher.stopWatching()

      if err? or res.exitStatus is not 0
        if err.details?.message is "Permissiond denied. Wrong password"
          @announce "Your password was incorrect, please try again", WRONG_PASSWORD
        else
          @announce "Failed to #{name}, please try again", FAILED
          console.error err
      else
        @init()

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
        console.error err

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
        kite.fsExists(path: configuredChecker)
          .then(resolve)
          .catch(reject)
