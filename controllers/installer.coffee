class ThinkupInstallerController extends KDController

  constructor:(options = {}, data)->

    {thinkupInstallerController} = KD.singletons
    return thinkupInstallerController if thinkupInstallerController

    super options, data

    @kiteHelper = new KiteHelper
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
            throw err

  command: (command, password, data)->
    switch command
      when INSTALL then name = "install"
      when REINSTALL then name = "reinstall"
      when UNINSTALL then name = "uninstall"
      else return throw "Command not registered."

    @lastCommand = command
    @announce "#{@namify name}ing #{appName}...", null, 0
    @watcher.watch()
    scriptCommand = "curl -sL #{scripts[name].url} | bash -s #{user} #{logger}"

    if command in [INSTALL, REINSTALL]
      scriptCommand += " #{@mysqlPassword}"

    @kiteHelper.run
      command: scriptCommand
      password: if scripts[name].sudo then password else null
    , (err, res)=>
      @watcher.stopWatching()

      if not err and res.exitStatus is 0
        @init()
      else
        if err and err.details.message is "Permissiond denied. Wrong password"
          @announce "Your password was incorrect, please try again", WRONG_PASSWORD
        else
          @announce "Failed to #{name}, please try again", FAILED
          throw err

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
