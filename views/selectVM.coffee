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

      @updateVms()

  namify: (hostname)->
    return hostname.split(".")[0]

  updateVms: ->
    @selection.updatePartial ""

    @kiteHelper.getVms().forEach (vm)=>
      @selection.addSubView vmItem = new KDCustomHTMLView
        tagName       : 'div'
        cssClass      : "item"
        click         : =>
          @kiteHelper.setDefaultVm vm.hostnameAlias
          @installer.init()
          @header.selected.updatePartial @namify(vm.hostnameAlias)
          @unsetClass "active"

          KD.utils.wait 2000, @bound "updateVms"

      vmItem.addSubView new KDCustomHTMLView
        tagName       : 'span'
        cssClass      : "bubble"

      vmItem.addSubView new KDCustomHTMLView
        tagName       : 'span'
        cssClass      : "name"
        partial       : @namify(vm.hostnameAlias)

      {vmController} = KD.singletons
      vmController.info vm.hostnameAlias, (err, vmn, info)=>
        vmItem.setClass info.state.toLowerCase()
