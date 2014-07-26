# DO NOT TOUCH
[NOT_INSTALLED, INSTALLED, WORKING,
FAILED, WRONG_PASSWORD, INSTALL,
REINSTALL, UNINSTALL]   = [0..7]
user                    = KD.nick()
domain                  = "#{user}.kd.io"
session                 = (Math.random() + 1).toString(36).substring 7

# Configure App Here
app                     = "thinkup"
appName                 = "Thinkup"
github                  = "https://rest.kd.io/bvallelunga/Thinkup.kdapp/master"
logo                    = "#{github}/resources/logo.png"
launchURL               = "https://#{domain}/thinkup/"
installChecker          = "/home/#{user}/Web/#{app}"
logger                  = "/tmp/_#{appName}Installer.out/#{session}"
description             = """   
<p>
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