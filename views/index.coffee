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
          unless configured 
            url     = configureURL
            message = "Please set the database to <strong>Thinkup</strong> when configuring the app.<br>"
          else 
            url     = launchURL
            message = ""
          
          @link.updatePartial """
            #{message}
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
        @passwordModal no, yes, (password, mysqlPassword)=>
          if password?
            @emailModal (key)=>
              if key?
                @Installer.mandrillKey = key
              
              @Installer.command INSTALL, password
              @Installer.mysqlPassword = mysqlPassword
      
    @buttonContainer.addSubView @reinstallButton = new KDButtonView
      title         : "Reinstall"
      cssClass      : 'button solid hidden'
      callback      : =>
        @passwordModal no, no, (password)=>
          if password?
            @Installer.command REINSTALL, password
        
    @buttonContainer.addSubView @uninstallButton = new KDButtonView
      title         : "Uninstall"
      cssClass      : 'button red solid hidden'
      callback      : =>
        @passwordModal no, no, (password)=>
          if password?
            @Installer.command UNINSTALL, password

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
      when WORKING
        @Installer.state = @Installer.lastState
        @updateProgress message, percentage
      when FAILED
        @Installer.state = @Installer.lastState
        @statusUpdate message, percentage
      when WRONG_PASSWORD
        @Installer.state = @Installer.lastState
        @passwordModal yes, no, (password)=>
          if password?
            @Installer.command @Installer.lastCommand, password
      else
        @updateProgress message, percentage
          
  passwordModal: (error, mysql, cb)->
    unless @modal
      unless error
        title = "#{appName} needs your Koding passwords"
      else
        title = "Incorrect password, please try again"
      
      fields =
        password        :
          type          : "password"
          placeholder   : "sudo password..."
          validate      :
            rules       :
              required  : yes
            messages    :
              required  : "password is required!"
        
      if mysql
        fields.mysqlPassword =
          type                : "password"
          placeholder         : "mysql root password..."
          validate            :
            rules             :
              required        : no
            messages          :
              required        : "password is required!"
        
    
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
          cb()
        tabs                    :
          navigable             : yes
          callback              : (form)=> 
            @modal.destroy()
            delete @modal
            cb form.password, form.mysqlPassword
          forms                 :
            "Koding Passwords"  :
              buttons           :
                Next            :
                  title         : "Submit"
                  style         : "modal-clean-green"
                  type          : "submit"
              fields            : fields

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
          cb()
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