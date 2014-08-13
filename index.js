/* Compiled by kdc on Wed Aug 13 2014 22:04:17 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
if (typeof window.appPreview !== "undefined" && window.appPreview !== null) {
  var appView = window.appPreview
}
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/config.coffee */
var ABORT, FAILED, INSTALL, INSTALLED, NOT_INSTALLED, REINSTALL, UNINSTALL, WORKING, WRONG_PASSWORD, app, appName, configureURL, configuredChecker, description, domain, getSession, github, installChecker, launchURL, logger, logo, scripts, user, vmHostname, _ref;

_ref = [0, 1, 2, 3, 4, 5, 6, 7, 8], NOT_INSTALLED = _ref[0], INSTALLED = _ref[1], WORKING = _ref[2], FAILED = _ref[3], WRONG_PASSWORD = _ref[4], INSTALL = _ref[5], ABORT = _ref[6], REINSTALL = _ref[7], UNINSTALL = _ref[8];

user = KD.nick();

domain = "" + user + ".kd.io";

vmHostname = "" + user + ".koding.kd.io";

getSession = function() {
  return (Math.random() + 1).toString(36).substring(7);
};

app = "thinkup";

appName = "Thinkup";

github = "https://rest.kd.io/bvallelunga/Thinkup.kdapp/master";

logo = "" + github + "/resources/logo.png";

launchURL = "/thinkup";

configureURL = "/thinkup/install";

installChecker = "/home/" + user + "/Web/" + app + "/";

configuredChecker = "/home/" + user + "/Web/" + app + "/config.inc.php";

logger = "/tmp/_" + appName + "Installer." + (getSession()) + ".out";

scripts = {
  install: {
    url: "" + github + "/scripts/install.sh",
    sudo: true
  },
  reinstall: {
    url: "" + github + "/scripts/reinstall.sh",
    sudo: true
  },
  uninstall: {
    url: "" + github + "/scripts/uninstall.sh",
    sudo: true
  }
};

description = "<div class=\"center bold\">There are things Facebook & Twitter don't tell you.</div>\n</p>\n<p>\nThinkUp is a free, installable web application that gives you insights into your\nactivity on social networks, including Twitter, Facebook, Foursquare, and Google+.\nFind out more at <a href=\"http://thinkup.com\">http://thinkup.com</a>.\n</p>\n<p>\n<img src=\"" + github + "/resources/description.png\"/>\n</p>";
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/views/selectVM.coffee */
var SelectVm,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SelectVm = (function(_super) {
  __extends(SelectVm, _super);

  function SelectVm(options, data) {
    if (options == null) {
      options = {};
    }
    this.kiteHelper = options.kiteHelper;
    this.installer = options.installer;
    options.cssClass = "" + appName + "-dropdown";
    SelectVm.__super__.constructor.call(this, options, data);
  }

  SelectVm.prototype.viewAppended = function() {
    return this.kiteHelper.getReady().then((function(_this) {
      return function() {
        _this.addSubView(_this.header = new KDCustomHTMLView({
          tagName: 'div',
          cssClass: 'header',
          click: function() {
            return _this.toggleClass("active");
          }
        }));
        _this.header.addSubView(_this.header.selected = new KDCustomHTMLView({
          tagName: 'div',
          cssClass: 'selected',
          partial: _this.namify(_this.kiteHelper.getVm())
        }));
        _this.header.addSubView(new KDCustomHTMLView({
          tagName: 'div',
          cssClass: 'arrow'
        }));
        _this.addSubView(_this.selection = new KDCustomHTMLView({
          tagName: 'div',
          cssClass: 'selection'
        }));
        return _this.kiteHelper.getVms().forEach(function(vm) {
          var vmController, vmItem;
          _this.selection.addSubView(vmItem = new KDCustomHTMLView({
            tagName: 'div',
            cssClass: "item",
            partial: _this.namify(vm.hostnameAlias),
            click: function(event) {
              var hostname;
              hostname = event.currentTarget.innerHTML;
              _this.kiteHelper.setDefaultVm(_this.denamify(hostname));
              _this.installer.init();
              _this.header.selected.updatePartial(hostname);
              return _this.unsetClass("active");
            }
          }));
          vmController = KD.singletons.vmController;
          return vmController.info(vm.hostnameAlias, function(err, vmn, info) {
            return vmItem.setClass(info.state.toLowerCase());
          });
        });
      };
    })(this));
  };

  SelectVm.prototype.namify = function(hostname) {
    return hostname.split(".")[0];
  };

  SelectVm.prototype.denamify = function(vm) {
    return "" + vm + "." + vmHostname;
  };

  return SelectVm;

})(KDView);
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/controllers/kiteHelper.coffee */
var KiteHelper,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KiteHelper = (function(_super) {
  __extends(KiteHelper, _super);

  function KiteHelper(options, data) {
    var kiteHelperController;
    if (options == null) {
      options = {};
    }
    this.vmIsStarting = false;
    kiteHelperController = KD.singletons.kiteHelperController;
    if (kiteHelperController) {
      return kiteHelperController;
    }
    this.registerSingleton("kiteHelperController", this, true);
    KiteHelper.__super__.constructor.call(this, options, data);
  }

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

  KiteHelper.prototype.setDefaultVm = function(vm) {
    this.defaultVm = vm;
    this.vmIsStarting = false;
    return this.getKite();
  };

  KiteHelper.prototype.getVm = function() {
    this.defaultVm || (this.defaultVm = this._vms.first.hostnameAlias);
    return this.defaultVm;
  };

  KiteHelper.prototype.getVms = function() {
    return this._vms.sort((function(_this) {
      return function(a, b) {
        return _this.getVMNumber(a) > _this.getVMNumber(b);
      };
    })(this));
  };

  KiteHelper.prototype.getVMNumber = function(_arg) {
    var hostnameAlias;
    hostnameAlias = _arg.hostnameAlias;
    return +(hostnameAlias.match(/\d+/)[0]);
  };

  KiteHelper.prototype.getKite = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return _this.getReady().then(function() {
          var kite, vm, vmController;
          vm = _this.getVm();
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
    return this.getKite().then(function(kite) {
      if (options.timeout == null) {
        options.timeout = 10 * 60 * 1000;
      }
      kite.options.timeout = options.timeout;
      return kite.exec(options).then(function(result) {
        if (callback) {
          return callback(null, result);
        }
      })["catch"](function(err) {
        if (callback) {
          callback({
            message: "Failed to run " + options.command,
            details: err
          });
        }
        return console.error(err);
      });
    })["catch"](function(err) {
      if (callback) {
        callback({
          message: "Failed to run " + options.command,
          details: err
        });
      }
      return console.error(err);
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
    this.kiteHelper = options.kiteHelper;
    this.registerSingleton("thinkupInstallerController", this, true);
    ThinkupInstallerController.__super__.constructor.call(this, options, data);
  }

  ThinkupInstallerController.prototype.announce = function(message, state, percentage) {
    if (state != null) {
      this.updateState(state);
    }
    return this.emit("status-update", message, percentage);
  };

  ThinkupInstallerController.prototype.error = function(err, message) {
    var state;
    message || (message = err.details.message || err.message);
    state = FAILED;
    switch (message) {
      case "Permissiond denied. Wrong password":
        message = "Your password was incorrect, please try again";
        state = WRONG_PASSWORD;
        break;
      case "CPU limit reached":
        message = "Please turn off one of your vms, to use another";
        state = ABORT;
    }
    console.log(err);
    return this.announce(message, state);
  };

  ThinkupInstallerController.prototype.init = function() {
    this.announce("Getting vm state...", WORKING, 0);
    return this.kiteHelper.getKite().then((function(_this) {
      return function(kite) {
        _this.watcherDirectory();
        return kite.fsExists({
          path: installChecker
        }).then(function(state) {
          if (!state) {
            return _this.announce("" + appName + " not installed", NOT_INSTALLED);
          } else {
            return _this.announce("" + appName + " is installed", INSTALLED);
          }
        })["catch"](function(err) {
          return _this.error(err);
        });
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        return _this.error(err);
      };
    })(this));
  };

  ThinkupInstallerController.prototype.command = function(command, password, retry) {
    var name, session;
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
        return console.error("Command not registered.");
    }
    this.lastCommand = command;
    this.announce("" + (this.namify(name)) + "ing " + appName + "...", null, 0);
    session = getSession();
    return this.configureWatcher(session).then((function(_this) {
      return function(watcher) {
        return _this.kiteHelper.run({
          command: "curl -sL " + scripts[name].url + " | bash -s " + user + " " + logger + "/" + session + "/ " + _this.mysqlPassword + " > " + logger + "/" + name + ".out",
          password: scripts[name].sudo ? password : null
        }, function(err, res) {
          console.log(err, res);
          watcher.stopWatching();
          if ((retry == null) && (err == null) && !res.stdout && !res.stderr) {
            return _this.command(_this.lastCommand, password, true);
          } else if ((err != null) || res.exitStatus !== 0) {
            return _this.error(err || {
              message: res.stderr
            }, "Failed to " + name + " " + appName + ", please contact support if the issue continues");
          } else {
            return _this.init();
          }
        });
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        return _this.error(err);
      };
    })(this));
  };

  ThinkupInstallerController.prototype.configureWatcher = function(session, cb) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return _this.kiteHelper.run({
          command: "mkdir -p " + logger + "/" + session
        }, function(err) {
          var watcher;
          if (!err) {
            watcher = new FSWatcher({
              path: "" + logger + "/" + session,
              recursive: false,
              vmName: _this.kiteHelper.getVm()
            });
            watcher.fileAdded = function(change) {
              var name, percentage, status, _ref;
              name = change.file.name;
              _ref = name.split('-'), percentage = _ref[0], status = _ref[1];
              if ((percentage != null) && (status != null)) {
                return _this.announce(status, WORKING, percentage);
              }
            };
            watcher.watch();
            return resolve(watcher);
          } else {
            return reject(err);
          }
        });
      };
    })(this));
  };

  ThinkupInstallerController.prototype.watcherDirectory = function() {
    return this.kiteHelper.run({
      command: "mkdir -p " + logger + "/"
    }, (function(_this) {
      return function(err) {
        if (err != null) {
          return _this.error(err);
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

  ThinkupInstallerController.prototype.isConfigured = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (!configuredChecker) {
          return resolve(true);
        }
        return _this.kiteHelper.getKite().then(function(kite) {
          return kite.fsExists({
            path: configuredChecker
          }).then(resolve)["catch"](reject);
        });
      };
    })(this));
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
    this.kiteHelper = new KiteHelper;
    this.installer = new ThinkupInstallerController({
      kiteHelper: this.kiteHelper
    });
    this.selectVm = new SelectVm({
      kiteHelper: this.kiteHelper,
      installer: this.installer
    });
    options.cssClass = "" + appName + "-installer main-view";
    ThinkupMainView.__super__.constructor.call(this, options, data);
  }

  ThinkupMainView.prototype.viewAppended = function() {
    this.addSubView(this.wrapper = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'wrapper'
    }));
    this.wrapper.addSubView(this.selectVm);
    this.wrapper.addSubView(this.container = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'container'
    }));
    this.container.addSubView(new KDCustomHTMLView({
      tagName: 'img',
      cssClass: 'logo',
      attributes: {
        src: logo
      }
    }));
    this.container.addSubView(this.progress = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'progress-container'
    }));
    this.progress.updateBar = function(percentage, unit, status) {
      if (percentage === 100) {
        this.loader.hide();
      } else {
        this.loader.show();
      }
      this.title.updatePartial(status);
      return this.bar.setWidth(percentage, unit);
    };
    this.progress.addSubView(this.progress.title = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'title',
      partial: 'Checking VM State...'
    }));
    this.progress.addSubView(this.progress.bar = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'bar'
    }));
    this.progress.addSubView(this.progress.loader = new KDLoaderView({
      showLoader: true,
      size: {
        width: 20
      },
      cssClass: "spinner"
    }));
    this.container.addSubView(this.link = new KDCustomHTMLView({
      cssClass: 'hidden running-link'
    }));
    this.link.setSession = (function(_this) {
      return function() {
        return _this.installer.isConfigured().then(function(configured) {
          var message, url;
          if (!configured) {
            url = configureURL;
            message = "Please set the database to <strong>Thinkup</strong> when configuring the app.<br>";
          } else {
            url = launchURL;
            message = "Thinkup has been configured for a demo using these credentials:\n<br>\n<strong>Username:</strong> demo@koding.com\n<br>\n<strong>Password:</strong> demo1234\n<br>";
          }
          url = "http://" + (_this.kiteHelper.getVm()) + url;
          _this.link.updatePartial("" + message + "\nClick here to launch " + appName + ":\n<a target='_blank' href='" + url + "'>" + url + "</a>");
          return _this.link.show();
        })["catch"](function(error) {
          console.error(error);
          return _this.updateProgress("Failed to check if " + appName + " is configured.");
        });
      };
    })(this);
    this.container.addSubView(this.buttonContainer = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'button-container'
    }));
    this.buttonContainer.addSubView(this.installButton = new KDButtonView({
      title: "Install " + appName,
      cssClass: 'button green solid hidden',
      callback: (function(_this) {
        return function() {
          _this.installButton.showLoader();
          return _this.passwordModal(false, function(password, mysqlPassword) {
            if (password != null) {
              return _this.installer.command(INSTALL, password);
            }
          });
        };
      })(this)
    }));
    this.buttonContainer.addSubView(this.reinstallButton = new KDButtonView({
      title: "Reinstall",
      cssClass: 'button solid hidden',
      callback: (function(_this) {
        return function() {
          _this.reinstallButton.showLoader();
          return _this.passwordModal(false, function(password) {
            if (password != null) {
              return _this.installer.command(REINSTALL, password);
            }
          });
        };
      })(this)
    }));
    this.buttonContainer.addSubView(this.uninstallButton = new KDButtonView({
      title: "Uninstall",
      cssClass: 'button red solid hidden',
      callback: (function(_this) {
        return function() {
          _this.uninstallButton.showLoader();
          return _this.passwordModal(false, function(password) {
            if (password != null) {
              return _this.installer.command(UNINSTALL, password);
            }
          });
        };
      })(this)
    }));
    this.container.addSubView(new KDCustomHTMLView({
      cssClass: "description",
      partial: description
    }));
    return KD.utils.defer((function(_this) {
      return function() {
        _this.installer.on("status-update", _this.bound("statusUpdate"));
        return _this.installer.init();
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
    switch (this.installer.state) {
      case NOT_INSTALLED:
        if (percentage === 100) {
          this.installButton.show();
        }
        return this.updateProgress(message, percentage);
      case INSTALLED:
        if (percentage === 100) {
          this.reinstallButton.show();
          this.uninstallButton.show();
          this.link.setSession();
        }
        return this.updateProgress(message, percentage);
      case WORKING:
        this.installer.state = this.installer.lastState;
        return this.updateProgress(message, percentage);
      case FAILED:
        this.installer.state = this.installer.lastState;
        return this.statusUpdate(message, percentage);
      case WRONG_PASSWORD:
        this.installer.state = this.installer.lastState;
        return this.passwordModal(true, (function(_this) {
          return function(password) {
            if (password != null) {
              return _this.installer.command(_this.installer.lastCommand, password);
            }
          };
        })(this));
      default:
        return this.updateProgress(message, percentage);
    }
  };

  ThinkupMainView.prototype.passwordModal = function(error, cb) {
    var fields, title;
    if (!this.modal) {
      if (!error) {
        title = "" + appName + " needs your Koding passwords";
      } else {
        title = "Incorrect password, please try again";
      }
      fields = {
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
        },
        mysqlPassword: {
          type: "password",
          placeholder: "mysql root password (leave blank if no password)..."
        }
      };
      return this.modal = new KDModalViewWithForms({
        title: title,
        overlay: true,
        overlayClick: false,
        width: 550,
        height: "auto",
        cssClass: "new-kdmodal",
        cancel: (function(_this) {
          return function() {
            _this.modal.destroy();
            delete _this.modal;
            return cb();
          };
        })(this),
        tabs: {
          navigable: true,
          callback: (function(_this) {
            return function(form) {
              _this.modal.destroy();
              delete _this.modal;
              _this.installer.mysqlPassword = form.mysqlPassword;
              return cb(form.password);
            };
          })(this),
          forms: {
            "Koding Passwords": {
              buttons: {
                Next: {
                  title: "Submit",
                  style: "modal-clean-green",
                  type: "submit"
                }
              },
              fields: fields
            }
          }
        }
      });
    }
  };

  ThinkupMainView.prototype.updateProgress = function(status, percentage) {
    if (percentage == null) {
      percentage = 100;
    }
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