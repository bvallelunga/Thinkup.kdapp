class KiteHelper extends KDController

  constructor:(options = {}, data)->
    @selectVm = new SelectVM
    @vmIsStarting = false
    super options, data

  getReady:->
    new Promise (resolve, reject) =>
      {JVM} = KD.remote.api
      JVM.fetchVmsByContext (err, vms)=>
        console.warn err  if err
        return unless vms

        @_vms = vms
        @_kites = {}

        kiteController = KD.getSingleton 'kiteController'

        for vm in vms
          alias = vm.hostnameAlias
          @_kites[alias] = kiteController
            .getKite "os-#{ vm.region }", alias, 'os'

        @emit 'ready'
        resolve()

  getVm: (cb)->
    if @defaultVm?
      return cb @defaultVm

    @selectVm.showModal @_vms, (vm)=>
      @defaultVm = vm
      cb vm

  getKite:->
    new Promise (resolve, reject)=>
      @getReady().then =>
        @getVm (vm)=>
          {vmController} = KD.singletons

          unless kite = @_kites[vm]
            return reject
              message: "No such kite for #{vm}"

          console.log vm

          vmController.info vm, (err, vmn, info)=>
            if not @vmIsStarting and info.state is "STOPPED"
              @vmIsStarting = true
              timeout = 10 * 60 * 1000
              kite.options.timeout = timeout

              kite.vmOn().then ->
                resolve kite
              .timeout(timeout)
              .catch (err)->
                reject err
            else
              resolve kite

  run:(options, callback)->
    @getKite().then (kite)->
      options.timeout ?= 10 * 60 * 1000
      kite.options.timeout = options.timeout
      kite.exec(options).then (result)->
        if callback
          callback null, result
      .catch (err)->
          if callback
            callback
              message : "Failed to run #{options.command}"
              details : err
          else
            console.error err
    .catch (err)->
      if callback
        callback
          message : "Failed to run #{options.command}"
          details : err
      else
        console.error err
