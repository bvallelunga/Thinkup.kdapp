# DO NOT TOUCH
[NOT_INSTALLED, INSTALLED, WORKING,
FAILED, WRONG_PASSWORD, INSTALL, ABORT
REINSTALL, UNINSTALL]   = [0..8]
user                    = KD.nick()
domain                  = "#{user}.kd.io"
vmHostname              = "#{user}.koding.kd.io"
getSession              = -> (Math.random() + 1).toString(36).substring 7

# Configure App Here
app                     = "thinkup"                                                 # App name used for variables
appName                 = "Thinkup"                                                 # App name used for titles and statuses
github                  = "https://rest.kd.io/bvallelunga/Thinkup.kdapp/master"     # Git repository on the master branch
logo                    = "#{github}/resources/logo.png"                            # The main logo centered at the top of the app
launchURL               = "/thinkup"                                                # The relative url used after the app is configured
configureURL            = "/thinkup/install"                                        # The relative url used to configure app
installChecker          = "/home/#{user}/Web/#{app}/"                               # Path used to check if the app is instaled
configuredChecker       = "/home/#{user}/Web/#{app}/config.inc.php"                 # Path used to check if app is configured (can be set to "false")
logger                  = "/tmp/_#{appName}Installer.#{getSession()}.out"           # Path used to log installer progress
scripts                 =                                                           # Scripts with url and if sudo access required
  install   :
    url     : "#{github}/scripts/install.sh"
    sudo    : true
  reinstall :
    url     : "#{github}/scripts/reinstall.sh"
    sudo    : true
  uninstall :
    url     : "#{github}/scripts/uninstall.sh"
    sudo    : true
description             =                                                           # The main description centered under the progress bar
"""
  <div class="center bold">There are things Facebook & Twitter don't tell you.</div>
</p>
<p>
  ThinkUp is a free, installable web application that gives you insights into your
  activity on social networks, including Twitter, Facebook, Foursquare, and Google+.
  Find out more at <a href="http://thinkup.com">http://thinkup.com</a>.
</p>
<p>
  <img src="#{github}/resources/description.png"/>
</p>
"""


# Addition Configuration Variables Here
