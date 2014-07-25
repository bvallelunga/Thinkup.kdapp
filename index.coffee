class ThinkupController extends AppController

  constructor:(options = {}, data)->
    options.view    = new ThinkupMainView
    options.appInfo =
      name : "Thinkup"
      type : "application"

    super options, data

do ->

  # In live mode you can add your App view to window's appView
  if appView?
    view = new ThinkupMainView
    appView.addSubView view

  else
    KD.registerAppClass ThinkupController,
      name     : "Thinkup"
      routes   :
        "/:name?/Thinkup" : null
        "/:name?/bvallelunga/Apps/Thinkup" : null
      dockPath : "/bvallelunga/Apps/Thinkup"
      behavior : "application"