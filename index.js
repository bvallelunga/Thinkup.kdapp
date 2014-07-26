/* Compiled by kdc on Sat Jul 26 2014 00:39:41 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
if (typeof window.appPreview !== "undefined" && window.appPreview !== null) {
  var appView = window.appPreview
}
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/config.coffee */
var FAILED, INSTALL, INSTALLED, NOT_INSTALLED, REINSTALL, UNINSTALL, WORKING, WRONG_PASSWORD, app, appName, description, domain, existingFile, github, launchURL, outPath, png, session, user, _ref;

app = "thinkup";

appName = "Thinkup";

user = KD.nick();

domain = "" + user + ".kd.io";

github = "https://rest.kd.io/bvallelunga/Thinkup.kdapp/master";

png = "" + github + "/resources/logo.png";

launchURL = "https://" + domain + "/thinkup/install/";

existingFile = "/home/" + user + "/Web/" + app;

session = (Math.random() + 1).toString(36).substring(7);

outPath = "/tmp/_" + appName + "Installer.out/" + session;

description = "   \n<p><br><b>From <a href=\"https://getcockpit.com/about\">https://getcockpit.com/about</a>:</b></p> \n<p>Cockpit was born out of the need of building a simple dynamic site. Sure, Wordpress, Joomla, Drupal and all the other full-stack content management systems are possible solutions for that task ... but let's be honest, often they are just too bloated and too time consuming to setup, maintain and too complex implementing custom functionality.</p>\n<p>Cockpits goal is to be <b>simple, but yet powerful</b> and designed in that way that you can spend less time trying to squeeze your site into a theme or template.</p>\n<p>Don't waste time on setting up a cms. You need a backup? Just zip your project folder or better, combine it with versioning systems like Git.</p>\n<p>Let Cockpit manage the content, implement and reuse the content the way you want. Everything is more stress free, <b>everything is just more simple.</b></p>\n<p><b>Note: Aftering the installation, when first logging into Cockpit, the default username and password is 'admin'.</b></p>";

_ref = [0, 1, 2, 3, 4, 5, 6, 7], NOT_INSTALLED = _ref[0], INSTALLED = _ref[1], WORKING = _ref[2], FAILED = _ref[3], WRONG_PASSWORD = _ref[4], INSTALL = _ref[5], REINSTALL = _ref[6], UNINSTALL = _ref[7];
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/controllers/kiteHelper.coffee */
var KiteHelper,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KiteHelper = (function(_super) {
  __extends(KiteHelper, _super);

  function KiteHelper() {
    return KiteHelper.__super__.constructor.apply(this, arguments);
  }

  KiteHelper.prototype.vmIsStarting = false;

  KiteHelper.prototype.getReady = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var JVM;
        JVM = KD.remote.api.JVM;
        return JVM.fetchVmsByContext(function(err, vms) {
          var alias, kiteController, vm, _i, _len;
          if (err) {
            console.warn(err);
          }
          if (!vms) {
            return;
          }
          _this._vms = vms;
          _this._kites = {};
          kiteController = KD.getSingleton('kiteController');
          for (_i = 0, _len = vms.length; _i < _len; _i++) {
            vm = vms[_i];
            alias = vm.hostnameAlias;
            _this._kites[alias] = kiteController.getKite("os-" + vm.region, alias, 'os');
          }
          _this.emit('ready');
          return resolve();
        });
      };
    })(this));
  };

  KiteHelper.prototype.getVm = function() {
    this._vm || (this._vm = this._vms.first);
    return this._vm;
  };

  KiteHelper.prototype.getKite = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return _this.getReady().then(function() {
          var kite, vm, vmController;
          vm = _this.getVm().hostnameAlias;
          vmController = KD.singletons.vmController;
          if (!(kite = _this._kites[vm])) {
            return reject({
              message: "No such kite for " + vm
            });
          }
          return vmController.info(vm, function(err, vmn, info) {
            var timeout;
            if (!_this.vmIsStarting && info.state === "STOPPED") {
              _this.vmIsStarting = true;
              timeout = 10 * 60 * 1000;
              kite.options.timeout = timeout;
              return kite.vmOn().then(function() {
                return resolve(kite);
              }).timeout(timeout)["catch"](function(err) {
                return reject(err);
              });
            } else {
              return resolve(kite);
            }
          });
        });
      };
    })(this));
  };

  KiteHelper.prototype.run = function(options, callback) {
    if (options.timeout == null) {
      options.timeout = 10 * 60 * 1000;
    }
    return this.getKite().then(function(kite) {
      kite.options.timeout = options.timeout;
      return kite.exec(options).then(function(result) {
        if (callback) {
          return callback(null, result);
        }
      })["catch"](function(err) {
        if (callback) {
          return callback({
            message: "Failed to run " + options.command,
            details: err
          });
        } else {
          return console.error(err);
        }
      });
    })["catch"](function(err) {
      if (callback) {
        return callback({
          message: "Failed to run " + options.command,
          details: err
        });
      } else {
        return console.error(err);
      }
    });
  };

  return KiteHelper;

})(KDController);
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/controllers/installer.coffee */
var ThinkupInstallerController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ThinkupInstallerController = (function(_super) {
  __extends(ThinkupInstallerController, _super);

  function ThinkupInstallerController(options, data) {
    var thinkupInstallerController;
    if (options == null) {
      options = {};
    }
    thinkupInstallerController = KD.singletons.thinkupInstallerController;
    if (thinkupInstallerController) {
      return thinkupInstallerController;
    }
    ThinkupInstallerController.__super__.constructor.call(this, options, data);
    this.kiteHelper = new KiteHelper;
    this.kiteHelper.ready(this.bound("configureWatcher"));
    this.registerSingleton("thinkupInstallerController", this, true);
  }

  ThinkupInstallerController.prototype.announce = function(message, state, percentage) {
    if (state != null) {
      this.updateState(state);
    }
    return this.emit("status-update", message, percentage);
  };

  ThinkupInstallerController.prototype.init = function() {
    return this.kiteHelper.getKite().then((function(_this) {
      return function(kite) {
        return kite.fsExists({
          path: existingFile
        }).then(function(state) {
          if (!state) {
            return _this.announce("" + appName + " not installed", NOT_INSTALLED);
          } else {
            return _this.announce("" + appName + " is installed", INSTALLED);
          }
        });
      };
    })(this));
  };

  ThinkupInstallerController.prototype.command = function(command, password) {
    var name;
    switch (command) {
      case INSTALL:
        name = "install";
        break;
      case REINSTALL:
        name = "reinstall";
        break;
      case UNINSTALL:
        name = "uninstall";
        break;
      default:
        throw "Command not registered.";
    }
    this.lastCommand = command;
    this.announce("" + (this.namify(name)) + "ing " + appName + "...", false, 0);
    this.watcher.watch();
    return this.kiteHelper.run({
      command: "curl -sL " + github + "/scripts/" + name + ".sh | bash -s " + user + " " + outPath,
      password: password
    }, (function(_this) {
      return function(err, res) {
        _this.watcher.stopWatching();
        if (!err && res.exitStatus === 0) {
          return _this.init();
        } else {
          if (err.details.message === "Permissiond denied. Wrong password") {
            return _this.announce("Your password was incorrect, please try again", WRONG_PASSWORD);
          } else {
            return _this.announce("Failed to " + name + ", please try again", FAILED);
          }
        }
      };
    })(this));
  };

  ThinkupInstallerController.prototype.configureWatcher = function() {
    return this.kiteHelper.run({
      command: "mkdir -p " + outPath
    }, (function(_this) {
      return function(err) {
        if (!err) {
          _this.watcher = new FSWatcher({
            path: outPath
          });
          return _this.watcher.fileAdded = function(change) {
            var name, percentage, status, _ref;
            name = change.file.name;
            _ref = name.split('-'), percentage = _ref[0], status = _ref[1];
            return _this.announce(status, WORKING, percentage);
          };
        } else {
          throw err;
        }
      };
    })(this));
  };

  ThinkupInstallerController.prototype.updateState = function(state) {
    this.lastState = this.state;
    return this.state = state;
  };

  ThinkupInstallerController.prototype.namify = function(name) {
    return (name.split(/\s+/).map(function(word) {
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })).join(' ');
  };

  return ThinkupInstallerController;

})(KDController);
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/views/index.coffee */
var ThinkupMainView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ThinkupMainView = (function(_super) {
  __extends(ThinkupMainView, _super);

  function ThinkupMainView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = "" + appName + "-installer main-view";
    this.Installer = new ThinkupInstallerController;
    ThinkupMainView.__super__.constructor.call(this, options, data);
  }

  ThinkupMainView.prototype.viewAppended = function() {
    this.addSubView(this.container = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'container'
    }));
    this.container.addSubView(this.header = new KDHeaderView({
      title: "" + appName + " Installer",
      type: "big"
    }));
    this.container.addSubView(this.logo = new KDCustomHTMLView({
      tagName: 'img',
      cssClass: 'logo',
      attributes: {
        src: png
      }
    }));
    this.container.addSubView(this.progress = new KDProgressBarView({
      initial: 100,
      title: "Checking VM State..."
    }));
    this.container.addSubView(this.link = new KDCustomHTMLView({
      cssClass: 'hidden running-link'
    }));
    this.link.setSession = function() {
      this.updatePartial("Click here to launch " + appName + ": \n<a target='_blank' href='" + launchURL + "'>" + launchURL + "</a>");
      return this.show();
    };
    this.container.addSubView(this.buttonContainer = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'button-container'
    }));
    this.buttonContainer.addSubView(this.installButton = new KDButtonView({
      title: "Install " + appName,
      cssClass: 'button green solid hidden',
      callback: (function(_this) {
        return function() {
          return _this.presentModal(_this.Installer.bound("command"), INSTALL);
        };
      })(this)
    }));
    this.buttonContainer.addSubView(this.reinstallButton = new KDButtonView({
      title: "Reinstall",
      cssClass: 'button solid hidden',
      callback: (function(_this) {
        return function() {
          return _this.presentModal(_this.Installer.bound("command"), REINSTALL);
        };
      })(this)
    }));
    this.buttonContainer.addSubView(this.uninstallButton = new KDButtonView({
      title: "Uninstall",
      cssClass: 'button red solid hidden',
      callback: (function(_this) {
        return function() {
          return _this.presentModal(_this.Installer.bound("command"), UNINSTALL);
        };
      })(this)
    }));
    this.container.addSubView(this.content = new KDCustomHTMLView({
      cssClass: "help",
      partial: description
    }));
    return KD.utils.defer((function(_this) {
      return function() {
        _this.Installer.on("status-update", _this.bound("statusUpdate"));
        return _this.Installer.init();
      };
    })(this));
  };

  ThinkupMainView.prototype.statusUpdate = function(message, percentage) {
    var element, _i, _len, _ref;
    if (percentage == null) {
      percentage = 100;
    }
    _ref = [this.installButton, this.reinstallButton, this.uninstallButton, this.link];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      element.hide();
    }
    switch (this.Installer.state) {
      case NOT_INSTALLED:
        this.installButton.show();
        return this.updateProgress(message, percentage);
      case INSTALLED:
        this.reinstallButton.show();
        this.uninstallButton.show();
        this.link.setSession();
        return this.updateProgress(message, percentage);
      case FAILED:
        this.Installer.state = this.Installer.lastState;
        return this.statusUpdate(message, percentage);
      case WRONG_PASSWORD:
        this.Installer.state = this.Installer.lastState;
        return this.presentModal(this.Installer.bound("command"), this.Installer.lastCommand);
      default:
        return this.updateProgress(message, percentage);
    }
  };

  ThinkupMainView.prototype.presentModal = function(cb, command) {
    if (!this.modal) {
      return this.modal = new KDModalViewWithForms({
        title: "Please enter your Koding password",
        overlay: true,
        width: 550,
        height: "auto",
        cssClass: "new-kdmodal",
        tabs: {
          navigable: true,
          callback: (function(_this) {
            return function(form) {
              cb(command, form.password);
              _this.modal.destroy();
              return delete _this.modal;
            };
          })(this),
          forms: {
            "Sudo Password": {
              buttons: {
                Next: {
                  title: "Submit",
                  style: "modal-clean-green",
                  type: "submit"
                }
              },
              fields: {
                password: {
                  type: "password",
                  placeholder: "sudo password...",
                  validate: {
                    rules: {
                      required: true
                    },
                    messages: {
                      required: "password is required!"
                    }
                  }
                }
              }
            }
          }
        }
      });
    }
  };

  ThinkupMainView.prototype.updateProgress = function(status, percentage) {
    return this.progress.updateBar(percentage, '%', status);
  };

  return ThinkupMainView;

})(KDView);
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/index.coffee */
var ThinkupController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ThinkupController = (function(_super) {
  __extends(ThinkupController, _super);

  function ThinkupController(options, data) {
    if (options == null) {
      options = {};
    }
    options.view = new ThinkupMainView;
    options.appInfo = {
      name: "Thinkup",
      type: "application"
    };
    ThinkupController.__super__.constructor.call(this, options, data);
  }

  return ThinkupController;

})(AppController);

(function() {
  var view;
  if (typeof appView !== "undefined" && appView !== null) {
    view = new ThinkupMainView;
    return appView.addSubView(view);
  } else {
    return KD.registerAppClass(ThinkupController, {
      name: "Thinkup",
      routes: {
        "/:name?/Thinkup": null,
        "/:name?/bvallelunga/Apps/Thinkup": null
      },
      dockPath: "/bvallelunga/Apps/Thinkup",
      behavior: "application"
    });
  }
})();

/* KDAPP ENDS */
}).call();