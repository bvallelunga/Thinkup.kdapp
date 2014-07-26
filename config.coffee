app                     = "thinkup"
appName                 = "Thinkup"
user                    = KD.nick()
domain                  = "#{user}.kd.io"
github                  = "https://rest.kd.io/bvallelunga/Thinkup.kdapp/master"
png                     = "#{github}/resources/logo.png"
launchURL               = "https://#{domain}/thinkup/install/"
existingFile            = "/home/#{user}/Web/#{app}"
session                 = (Math.random() + 1).toString(36).substring 7
outPath                 = "/tmp/_#{appName}Installer.out/#{session}"
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