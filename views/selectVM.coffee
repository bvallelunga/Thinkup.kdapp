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

      @header.addSubView new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : 'type'
        partial       : "VM"

      @header.addSubView @header.selected = new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : 'selected'
        partial       : @kiteHelper.getVm()

      @addSubView @selection = new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : 'selection'

      for vm in @kiteHelper._vms
        @selection.addSubView new KDCustomHTMLView
          tagName       : 'div'
          cssClass      : 'item'
          partial       : vm.hostnameAlias
          click         : (event)=>
            vmHostname = event.currentTarget.innerHTML
            @header.selected.updatePartial vmHostname
            @kiteHelper.setDefaultVm vmHostname
            @installer.init()
            @unsetClass "active"
