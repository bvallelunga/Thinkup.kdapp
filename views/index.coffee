class ThinkupMainView extends KDView
    
  constructor:(options = {}, data)->
    options.cssClass = "#{appName}-installer main-view"
    @Installer = new ThinkupInstallerController
    super options, data
  
  viewAppended: ->
    @addSubView @container = new KDCustomHTMLView
      tagName       : 'div'
      cssClass      : 'container'

    @container.addSubView new KDCustomHTMLView
      tagName       : 'img'
      cssClass      : 'logo'
      attributes    :
        src         : logo
    
    @container.addSubView @progress = new KDProgressBarView
      initial       : 100
      title         : "Checking VM State..."

    @container.addSubView @link = new KDCustomHTMLView
      cssClass : 'hidden running-link'
      
    @link.setSession = =>
      @Installer.isConfigured()
        .then (configured)=>
          url = if configured then launchURL else configureURL
          
          @link.updatePartial """
            Click here to launch #{appName}: 
            <a target='_blank' href='#{url}'>#{url}</a>
          """
          @link.show()
        .catch (error)=>
          console.error error
          @link.updatePartial "Failed to check if #{appName} is configured."
          @link.show()
          
    
    @container.addSubView @buttonContainer = new KDCustomHTMLView
      tagName       : 'div'
      cssClass      : 'button-container'
    
    @buttonContainer.addSubView @installButton = new KDButtonView
      title         : "Install #{appName}"
      cssClass      : 'button green solid hidden'
      callback      : =>
        @presentModal @Installer.bound("command"), INSTALL
      
    @buttonContainer.addSubView @reinstallButton = new KDButtonView
      title         : "Reinstall"
      cssClass      : 'button solid hidden'
      callback      : =>
        @presentModal @Installer.bound("command"), REINSTALL
        
    @buttonContainer.addSubView @uninstallButton = new KDButtonView
      title         : "Uninstall"
      cssClass      : 'button red solid hidden'
      callback      : =>
        @presentModal @Installer.bound("command"), UNINSTALL

    @container.addSubView new KDCustomHTMLView
      cssClass : "description"
      partial  : description
    
    KD.utils.defer =>
      @Installer.on "status-update", @bound "statusUpdate"
      @Installer.init()
    
  statusUpdate: (message, percentage)->
    percentage ?= 100
    element.hide() for element in [
      @installButton, @reinstallButton, @uninstallButton, @link
    ]
    
    switch @Installer.state
      when NOT_INSTALLED 
        @installButton.show()
        @updateProgress message, percentage
      when INSTALLED
        @reinstallButton.show()
        @uninstallButton.show()
        @link.setSession()
        @updateProgress message, percentage
      when FAILED
        @Installer.state = @Installer.lastState
        @statusUpdate message, percentage
      when WRONG_PASSWORD
        @Installer.state = @Installer.lastState
        @presentModal @Installer.bound("command"), @Installer.lastCommand, yes
      else
        @updateProgress message, percentage
          
  
  presentModal: (cb, command, error)->
    unless @modal
      unless error
        title = "Please enter your Koding password"
      else
        title = "Incorrect password, please try again"
    
      @modal = new KDModalViewWithForms
       title     : title
       overlay   : yes
       width     : 550
       height    : "auto"
       cssClass  : "new-kdmodal"
       tabs                    :
         navigable             : yes
         callback              : (form)=> 
           cb command, form.password
           @modal.destroy()
           delete @modal
         forms                 :
           "Sudo Password"     :
             buttons           :
               Next            :
                 title         : "Submit"
                 style         : "modal-clean-green"
                 type          : "submit"
             fields            :
               password        :
                 type          : "password"
                 placeholder   : "sudo password..."
                 validate      :
                   rules       :
                     required  : yes
                   messages    :
                     required  : "password is required!"
  
  updateProgress: (status, percentage)->
    @progress.updateBar percentage, '%', status