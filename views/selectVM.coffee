class SelectVm extends KDView

  constructor: (options = {}, data)->
    @kiteHelper = options.kiteHelper
    @installer = options.installer
    options.cssClass = "#{appName}-dropdown"
    super options, data

  viewAppended: ->
    @kiteHelper.getReady().then =>
      @addSubView @header = new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : 'header'
        click         : =>
          @unsetClass "turnOff"
          @updateList()

      @header.addSubView @header.selected = new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : 'selected'
        partial       : @namify(@kiteHelper.getVm())

      @header.addSubView new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : 'arrow'

      @addSubView @selection = new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : 'selection'

  namify: (hostname)->
    return hostname.split(".")[0]

  updateList: (mode="choose")->
    @toggleClass mode
    @selection.updatePartial ""

    @kiteHelper.getVms().forEach (vm)=>
      if mode is "choose" and vm.hostnameAlias is @kiteHelper.getVm()
        return

      @selection.addSubView vmItem = new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : "item"
        click         : =>
          switch mode
            when "choose" then @chooseVm vm.hostnameAlias
            when "turnOff" then @turnOffVm vm.hostnameAlias

          @unsetClass mode

      vmItem.addSubView new KDCustomHTMLView
        tagName       : 'span'
        cssClass      : "bubble"

      vmItem.addSubView new KDCustomHTMLView
        tagName       : 'span'
        cssClass      : "name"
        partial       : @namify vm.hostnameAlias

      {vmController} = KD.singletons
      vmController.info vm.hostnameAlias, (err, vmn, info)=>
        if mode is "turnOff" and info?.state != "RUNNING"
          vmItem.destroy()

        vmItem.setClass info?.state.toLowerCase()

  chooseVm: (vm)->
    @kiteHelper.setDefaultVm vm
    @installer.init()
    @header.selected.updatePartial @namify vm

  turnOffVm: (vm)->
    @installer.announce "Please wait while we turn off #{@namify vm}...", WORKING

    @kiteHelper.turnOffVm(vm).then =>
      # Wait for Koding to register other vm is off
      KD.utils.wait 10000, @installer.bound "init"
    .catch (err)=>
      @installer.error err
