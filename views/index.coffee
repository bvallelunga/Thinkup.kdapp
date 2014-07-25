class ThinkupMainView extends KDView
  
  appName                 = "Thinkup"
  domain                  = "#{KD.nick()}.kd.io"
  github                  = "https://raw.githubusercontent.com/bvallelunga/Thinkup.kdapp/master"
  png                     = "#{github}/resources/logo.png"
  launchURL               = "https://#{domain}/thinkup"
  description             = """   
    <p><br><b>From <a href="https://getcockpit.com/about">https://getcockpit.com/about</a>:</b></p> 
    <p>Cockpit was born out of the need of building a simple dynamic site. Sure, Wordpress, Joomla, Drupal and all the other full-stack content management systems are possible solutions for that task ... but let's be honest, often they are just too bloated and too time consuming to setup, maintain and too complex implementing custom functionality.</p>
    <p>Cockpits goal is to be <b>simple, but yet powerful</b> and designed in that way that you can spend less time trying to squeeze your site into a theme or template.</p>
    <p>Don't waste time on setting up a cms. You need a backup? Just zip your project folder or better, combine it with versioning systems like Git.</p>
    <p>Let Cockpit manage the content, implement and reuse the content the way you want. Everything is more stress free, <b>everything is just more simple.</b></p>
    <p><b>Note: Aftering the installation, when first logging into Cockpit, the default username and password is 'admin'.</b></p>
  """
  [NOT_INSTALLED, INSTALLED, WORKING,
  FAILED, WRONG_PASSWORD, INSTALL,
  REINSTALL, UNINSTALL]   = [0..7]
    
  constructor:(options = {}, data)->
    options.cssClass = "#{appName}-installer main-view"
    @Installer = new ThinkupInstallerController
    super options, data
  
  viewAppended:->
    
    @addSubView @container = new KDCustomHTMLView
      tagName       : 'div'
      cssClass      : 'container'
    
    @container.addSubView @header = new KDHeaderView
      title         : "#{appName} Installer"
      type          : "big"

    @container.addSubView @logo = new KDCustomHTMLView
      tagName       : 'img'
      cssClass      : 'logo'
      attributes    :
        src         : png
    
    @container.addSubView @progress = new KDProgressBarView
      initial       : 100
      title         : "Checking VM State..."

    @container.addSubView @link = new KDCustomHTMLView
      cssClass : 'hidden running-link'
      
    @link.setSession = ->
      @updatePartial """
        Click here to launch #{appName}: 
        <a target='_blank' href='#{launchURL}'>#{launchURL}</a>
      """
      @show()        
    
    @container.addSubView @buttonContainer = new KDCustomHTMLView
      tagName       : 'div'
      cssClass      : 'button-container'
    
    @buttonContainer.addSubView @installButton = new KDButtonView
      title         : "Install #{appName}"
      cssClass      : 'button green solid hidden'
      callback      : =>
        @presentModal Installer.bound("command"), INSTALL
      
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

    @container.addSubView @content = new KDCustomHTMLView
      cssClass : "help"
      partial  : description
    
    KD.utils.defer =>
      @Installer.on "status-update", @bound "statusUpdate"
      @Installer.init()
    
  statusUpdate: (message, percentage)->
    console.log message, percentage, @Installer.state
    
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
        @presentModal @Installer.bound("command"), @Installer.lastState
      else
        @updateProgress message, percentage
          
  
  presentModal: (cb, command)->
    unless @modal
      @modal = new KDModalViewWithForms
       title     : "Please enter your Koding password"
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