class SelectVM extends KDView

  constructor: (options = {}, data)->
    super options, data

  showModal: (vms, cb)->
      unless @modal
        @addSubView container = new KDCustomHTMLView
          tagName       : 'div'

        for vm in vms
          container.addSubView new KDCustomHTMLView
            tagName       : 'div'
            cssClass      : "item"
            partial       : vm.hostnameAlias
            click         : (event)=>
              cb event.currentTarget.innerHTML
              @removeModal()

        @modal = new KDModalView
          title           : "Select VM"
          overlay         : yes
          overlayClick    : no
          width           : 400
          height          : "auto"
          cssClass        : "new-kdmodal"
          view            : container
          cancel          : => @removeModal()

  removeModal: ->
    @modal.destroy()
    delete @modal
