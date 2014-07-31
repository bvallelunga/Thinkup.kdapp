/* Compiled by kdc on Thu Jul 31 2014 19:39:37 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/config.coffee */
var FAILED, INSTALL, INSTALLED, NOT_INSTALLED, REINSTALL, UNINSTALL, WORKING, WRONG_PASSWORD, app, appName, configureURL, configuredChecker, description, domain, github, installChecker, launchURL, logger, logo, session, user, _ref;

_ref = [0, 1, 2, 3, 4, 5, 6, 7], NOT_INSTALLED = _ref[0], INSTALLED = _ref[1], WORKING = _ref[2], FAILED = _ref[3], WRONG_PASSWORD = _ref[4], INSTALL = _ref[5], REINSTALL = _ref[6], UNINSTALL = _ref[7];

user = KD.nick();

domain = "" + user + ".kd.io";

session = (Math.random() + 1).toString(36).substring(7);

app = "thinkup";

appName = "Thinkup";

github = "https://rest.kd.io/bvallelunga/Thinkup.kdapp/master";

logo = "" + github + "/resources/logo.png";

launchURL = "https://" + domain + "/" + app + "/";

configureURL = "https://" + domain + "/" + app + "/install";

installChecker = "/home/" + user + "/Web/" + app + "/";

configuredChecker = "/home/" + user + "/Web/" + app + "/config.inc.php";

logger = "/tmp/_" + appName + "Installer.out/" + session + "/";

description = "<p>\n  <div class=\"center bold\">There are things Facebook & Twitter don't tell you.</div>\n</p>\n<p>\n  ThinkUp is a free, installable web application that gives you insights into your\n  activity on social networks, including Twitter, Facebook, Foursquare, and Google+. \n  Find out more at <a href=\"http://thinkup.com\">http://thinkup.com</a>.\n</p>\n<p>\n  <img src=\"" + github + "/resources/description.png\"/>\n</p>";
/* BLOCK STARTS: /home/bvallelunga/Applications/Thinkup.kdapp/controllers/kiteHelper.coffee */
var KiteHelper, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KiteHelper = (function(_super) {
  __extends(KiteHelper, _super);

  function KiteHelper() {
    _ref = KiteHelper.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KiteHelper.prototype.vmIsStarting = false;

  KiteHelper.prototype.getReady = function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
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
    });
  };

  KiteHelper.prototype.getVm = function() {
    this._vm || (this._vm = this._vms.first);
    return this._vm;
  };

  KiteHelper.prototype.getKite = function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
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
    });
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
    var _this = this;
    return this.kiteHelper.getKite().then(function(kite) {
      return kite.fsExists({
        path: installChecker
      }).then(function(state) {
        if (!state) {
          _this.announce("" + appName + " not installed", NOT_INSTALLED);
          if (_this.configWatcher != null) {
            return _this.configWatcher.stopWatching();
          }
        } else {
          _this.announce("" + appName + " is installed", INSTALLED);
          return _this.configureEmailWatcher();
        }
      })["catch"](function(err) {
        _this.announce("Failed to see if " + appName + " is installed", FAILED);
        throw err;
      });
    });
  };

  ThinkupInstallerController.prototype.command = function(command, password) {
    var name,
      _this = this;
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
    this.announce("" + (this.namify(name)) + "ing " + appName + "...", null, 0);
    this.watcher.watch();
    return this.kiteHelper.run({
      command: "curl -sL " + github + "/scripts/" + name + ".sh | bash -s " + user + " " + logger,
      password: password
    }, function(err, res) {
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
    });
  };

  ThinkupInstallerController.prototype.configureWatcher = function() {
    var _this = this;
    return this.kiteHelper.run({
      command: "mkdir -p " + logger
    }, function(err) {
      if (!err) {
        _this.watcher = new FSWatcher({
          path: logger,
          recursive: false
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
    });
  };

  ThinkupInstallerController.prototype.configureEmail = function() {
    var find, replace,
      _this = this;
    find = "\\$THINKUP_CFG\\['mandrill_api_key'\\] \\= ''";
    replace = "\\$THINKUP_CFG['mandrill_api_key'] = '" + this.mandrillKey + "'";
    return this.kiteHelper.run({
      command: "sed -i  \"s/" + find + "/" + replace + "/g\" " + configuredChecker + ";\nmysql -u root --password=" + this.mysqlPassword + " -e 'USE Thinkup; UPDATE tu_owners SET is_activated=1;'"
    }, function(err) {
      if (err) {
        console.error(err);
        return _this.announce("Failed to configure email client, please try again");
      }
    });
  };

  ThinkupInstallerController.prototype.configureEmailWatcher = function() {
    var _this = this;
    if (this.configWatcher) {
      this.configWatcher.stopWatching();
      delete this.configWatcher;
    }
    this.configWatcher = new FSWatcher({
      path: installChecker,
      recursive: false
    });
    this.configWatcher.fileAdded = function(change) {
      if (change.file.name === "config.inc.php") {
        _this.configWatcher.stopWatching();
        return _this.configureEmail();
      }
    };
    return this.configWatcher.watch();
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
    var _this = this;
    return new Promise(function(resolve, reject) {
      if (!configuredChecker) {
        return resolve(true);
      }
      return _this.kiteHelper.getKite().then(function(kite) {
        return kite.fsExists({
          path: configuredChecker
        }).then(resolve["catch"](reject));
      });
    });
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
    var _this = this;
    this.addSubView(this.container = new KDCustomHTMLView({
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
    this.container.addSubView(this.progress = new KDProgressBarView({
      initial: 100,
      title: "Checking VM State..."
    }));
    this.container.addSubView(this.link = new KDCustomHTMLView({
      cssClass: 'hidden running-link'
    }));
    this.link.setSession = function() {
      return _this.Installer.isConfigured().then(function(configured) {
        var message, url;
        if (!configured) {
          url = configureURL;
          message = "Please set the database to <strong>Thinkup</strong> when configuring the app.<br>";
        } else {
          url = launchURL;
          message = "";
        }
        _this.link.updatePartial("" + message + "\nClick here to launch " + appName + ": \n<a target='_blank' href='" + url + "'>" + url + "</a>");
        return _this.link.show();
      })["catch"](function(error) {
        console.error(error);
        _this.link.updatePartial("Failed to check if " + appName + " is configured.");
        return _this.link.show();
      });
    };
    this.container.addSubView(this.buttonContainer = new KDCustomHTMLView({
      tagName: 'div',
      cssClass: 'button-container'
    }));
    this.buttonContainer.addSubView(this.installButton = new KDButtonView({
      title: "Install " + appName,
      cssClass: 'button green solid hidden',
      callback: function() {
        return _this.passwordModal(false, true, function(password, mysqlPassword) {
          if (password != null) {
            return _this.emailModal(function(key) {
              if (key != null) {
                _this.Installer.mandrillKey = key;
              }
              _this.Installer.command(INSTALL, password);
              return _this.Installer.mysqlPassword = mysqlPassword;
            });
          }
        });
      }
    }));
    this.buttonContainer.addSubView(this.reinstallButton = new KDButtonView({
      title: "Reinstall",
      cssClass: 'button solid hidden',
      callback: function() {
        return _this.passwordModal(false, false, function(password) {
          if (password != null) {
            return _this.Installer.command(REINSTALL, password);
          }
        });
      }
    }));
    this.buttonContainer.addSubView(this.uninstallButton = new KDButtonView({
      title: "Uninstall",
      cssClass: 'button red solid hidden',
      callback: function() {
        return _this.passwordModal(false, false, function(password) {
          if (password != null) {
            return _this.Installer.command(UNINSTALL, password);
          }
        });
      }
    }));
    this.container.addSubView(new KDCustomHTMLView({
      cssClass: "description",
      partial: description
    }));
    return KD.utils.defer(function() {
      _this.Installer.on("status-update", _this.bound("statusUpdate"));
      return _this.Installer.init();
    });
  };

  ThinkupMainView.prototype.statusUpdate = function(message, percentage) {
    var element, _i, _len, _ref,
      _this = this;
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
      case WORKING:
        this.Installer.state = this.Installer.lastState;
        return this.updateProgress(message, percentage);
      case FAILED:
        this.Installer.state = this.Installer.lastState;
        return this.statusUpdate(message, percentage);
      case WRONG_PASSWORD:
        this.Installer.state = this.Installer.lastState;
        return this.passwordModal(true, false, function(password) {
          if (password != null) {
            return _this.Installer.command(_this.Installer.lastCommand, password);
          }
        });
      default:
        return this.updateProgress(message, percentage);
    }
  };

  ThinkupMainView.prototype.passwordModal = function(error, mysql, cb) {
    var fields, title,
      _this = this;
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
        }
      };
      if (mysql) {
        fields.mysqlPassword = {
          type: "password",
          placeholder: "mysql root password..."
        };
      }
      return this.modal = new KDModalViewWithForms({
        title: title,
        overlay: true,
        overlayClick: false,
        width: 550,
        height: "auto",
        cssClass: "new-kdmodal",
        cancel: function() {
          _this.modal.destroy();
          delete _this.modal;
          return cb();
        },
        tabs: {
          navigable: true,
          callback: function(form) {
            _this.modal.destroy();
            delete _this.modal;
            return cb(form.password, form.mysqlPassword);
          },
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

  ThinkupMainView.prototype.emailModal = function(cb) {
    var _this = this;
    if (!this.modal) {
      this.modal = new KDModalViewWithForms({
        title: "Please enter your Mandrill API key",
        content: "<p>\n  To fully utilize " + appName + ", the ability to send emails\n  is required. With Mandrill you can send emails straight from\n  your vm. Here is the quick installation process:\n</p>\n<p>\n  <ol>\n    <li>Create an account on <a target=\"_blank\" href=\"//mandrill.com/signup\">Mandrill</a></li>\n    <li>In the dashboard click, <a target=\"_blank\" href=\"//mandrillapp.com/settings/\">Get Api Keys</a></li>\n    <li>Create an API Key</li>\n    <li>Copy API Key and paste into the form below</li>\n  </ol>\n</p>",
        overlay: true,
        overlayClick: false,
        width: 550,
        height: "auto",
        cssClass: "new-kdmodal",
        cancel: function() {
          _this.modal.destroy();
          delete _this.modal;
          return cb();
        },
        tabs: {
          navigable: true,
          callback: function(form) {
            _this.modal.destroy();
            delete _this.modal;
            return cb(form.key);
          },
          forms: {
            "API Key": {
              buttons: {
                Next: {
                  title: "Submit",
                  style: "modal-clean-green",
                  type: "submit"
                }
              },
              fields: {
                key: {
                  type: "text",
                  placeholder: "api key..."
                }
              }
            }
          }
        }
      });
      return this.modal;
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