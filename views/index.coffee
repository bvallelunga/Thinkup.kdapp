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
        @passwordModal no, (password)=>
          @emailModal (key)=>
            @Installer.command INSTALL, password
            @Installer.mandrillKey = key
      
    @buttonContainer.addSubView @reinstallButton = new KDButtonView
      title         : "Reinstall"
      cssClass      : 'button solid hidden'
      callback      : =>
        @passwordModal @Installer.bound("command"), REINSTALL
        
    @buttonContainer.addSubView @uninstallButton = new KDButtonView
      title         : "Uninstall"
      cssClass      : 'button red solid hidden'
      callback      : =>
        @passwordModal @Installer.bound("command"), UNINSTALL

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
        @passwordModal yes, (password)=>
          @Installer.command @Installer.lastCommand, password
      else
        @updateProgress message, percentage
          
  
  passwordModal: (error, cb)->
    unless @modal
      unless error?
        title = "#{appName} needs sudo access to continue"
      else
        title = "Incorrect password, please try again"
    
      @modal = new KDModalViewWithForms
        title         : title
        overlay       : yes
        overlayClick  : no
        width         : 550
        height        : "auto"
        cssClass      : "new-kdmodal"
        cancel        : =>
          @modal.destroy()
          delete @modal
          cb ""
        tabs                    :
          navigable             : yes
          callback              : (form)=> 
            @modal.destroy()
            delete @modal
            cb form.password
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
                     
  emailModal: (cb)->
    unless @modal
      @modal = new KDModalViewWithForms
        title    : "Please enter your Mandrill API key"
        content  : """
        <p>
          To fully utilize #{appName}, the ability to send emails
          is required. With Mandrill you can send emails straight from
          your vm. Here is the quick installation process:
        </p>
        <p>
          <ol>
            <li>Create an account on <a target="_blank" href="//mandrill.com/signup">Mandrill</a></li>
            <li>In the dashboard click, <a target="_blank" href="//mandrillapp.com/settings/">Get Api Keys</a></li>
            <li>Create an API Key</li>
            <li>Copy API Key and paste into the form below</li>
          </ol>
        </p>
        """
        overlay       : yes
        overlayClick  : no
        width         : 550
        height        : "auto"
        cssClass      : "new-kdmodal"
        cancel        : =>
          @modal.destroy()
          delete @modal
          cb ""
        tabs                    :
          navigable             : yes
          callback              : (form)=>
            @modal.destroy()
            delete @modal
            cb form.key 
          forms                 :
            "API Key"           :
              buttons           :
                Next            :
                  title         : "Submit"
                  style         : "modal-clean-green"
                  type          : "submit"
              fields            :
                key             :
                  type          : "text"
                  placeholder   : "api key..."
                  validate      :
                    rules       :
                      required  : yes
                    messages    :
                      required  : "api key is required!"
      
      @modal
  
  updateProgress: (status, percentage)->
    @progress.updateBar percentage, '%', status