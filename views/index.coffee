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

    @container.addSubView @progress = new KDCustomHTMLView
      tagName       : 'div'
      cssClass      : 'progress-container'

    @progress.updateBar = (percentage, unit, status)->
      if percentage is 100
        @loader.hide()
      else
        @loader.show()

      @title.updatePartial(status)
      @bar.setWidth(percentage, unit)

    @progress.addSubView @progress.title = new KDCustomHTMLView
      tagName       : 'div'
      cssClass      : 'title'
      partial       : 'Checking VM State...'

    @progress.addSubView @progress.bar = new KDCustomHTMLView
      tagName       : 'div'
      cssClass      : 'bar'

    @progress.addSubView @progress.loader = new KDLoaderView
      showLoader    : yes
      size          :
        width       : 20
      cssClass      : "spinner"

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
            message = """
              Thinkup has been configured for a demo using these credentials:
              <br>
              <strong>Username:</strong> demo@koding.com
              <br>
              <strong>Password:</strong> demo1234
              <br>
            """

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
        @installButton.showLoader()
        @passwordModal no, (password, mysqlPassword)=>
          if password?
            @Installer.command INSTALL, password
          else
            @installButton.hideLoader()

    @buttonContainer.addSubView @reinstallButton = new KDButtonView
      title         : "Reinstall"
      cssClass      : 'button solid hidden'
      callback      : =>
        @reinstallButton.showLoader()
        @passwordModal no, (password)=>
          if password?
            @Installer.command REINSTALL, password
          else
            @reinstallButton.hideLoader()

    @buttonContainer.addSubView @uninstallButton = new KDButtonView
      title         : "Uninstall"
      cssClass      : 'button red solid hidden'
      callback      : =>
        @uninstallButton.showLoader()
        @passwordModal no, (password)=>
          if password?
            @Installer.command UNINSTALL, password
          else
            @uninstallButton.hideLoader()

    @container.addSubView new KDCustomHTMLView
      cssClass : "description"
      partial  : description

    KD.utils.defer =>
      @Installer.on "status-update", @bound "statusUpdate"
      @Installer.init()

  statusUpdate: (message, percentage)->
    percentage ?= 100

    if percentage is 100
      if @Installer.state in [NOT_INSTALLED, INSTALLED, FAILED]
        element.hide() for element in [
          @installButton, @reinstallButton, @uninstallButton
        ]

    switch @Installer.state
      when NOT_INSTALLED
        @link.hide()
        @installButton.show()
        @updateProgress message, percentage
      when INSTALLED
        @link.show()
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
        @passwordModal yes, (password)=>
          if password?
            @Installer.command @Installer.lastCommand, password
      else
        @updateProgress message, percentage

  passwordModal: (error, cb)->
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
        mysqlPassword   :
          type          : "password"
          placeholder   : "mysql root password (leave blank if no password)..."

      @modal = new KDModalViewWithForms
        title           : title
        overlay         : yes
        overlayClick    : no
        width           : 550
        height          : "auto"
        cssClass        : "new-kdmodal"
        cancel          : =>
          @modal.destroy()
          delete @modal
          cb()
        tabs                    :
          navigable             : yes
          callback              : (form)=>
            @modal.destroy()
            delete @modal
            @Installer.mysqlPassword = form.mysqlPassword
            cb form.password
          forms                 :
            "Koding Passwords"  :
              buttons           :
                Next            :
                  title         : "Submit"
                  style         : "modal-clean-green"
                  type          : "submit"
              fields            : fields

      @modal

  updateProgress: (status, percentage)->
    @progress.updateBar percentage, '%', status
