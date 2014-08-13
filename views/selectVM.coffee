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
          @toggleClass "active"

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

      @kiteHelper.getVms().forEach (vm)=>
        @selection.addSubView vmItem = new KDCustomHTMLView
          tagName       : 'div'
          cssClass      : "item"
          partial       : @namify(vm.hostnameAlias)
          click         : (event)=>
            hostname = event.currentTarget.innerHTML
            @kiteHelper.setDefaultVm @denamify(hostname)
            @installer.init()
            @header.selected.updatePartial hostname
            @unsetClass "active"

        {vmController} = KD.singletons
        vmController.info vm.hostnameAlias, (err, vmn, info)=>
          vmItem.setClass info.state.toLowerCase()

  namify: (hostname)->
    return hostname.split(".")[0]

  denamify: (vm)->
    return "#{vm}.#{vmHostname}"
