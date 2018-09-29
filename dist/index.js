'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var EventEmitter = _interopDefault(require('events'));
var browserOrNode = require('browser-or-node');
var detectBrowser = require('detect-browser');
var createLogger = _interopDefault(require('logging'));
var eccrypto = _interopDefault(require('eccrypto'));
var ethUtils = _interopDefault(require('ethereumjs-util'));
var crypto = _interopDefault(require('crypto'));
var secp256k1 = _interopDefault(require('secp256k1'));
var debugLogger = _interopDefault(require('debug'));
var io = _interopDefault(require('socket.io-client'));
var SimplePeer = _interopDefault(require('simple-peer'));

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var version = "1.0.4";

var version$1 = version;
var stunServers = [{
  urls: 'stun:stun.l.google.com:19302'
}, {
  urls: 'stun:global.stun.twilio.com:3478?transport=udp'
}];

var versions = ['0.0.1'];
var connectionCodeSchemas = {
  '0.0.1': ['version', 'key', 'connId']
};
var connectionCodeSeparator = '_';
var signal = {
  attemptingTurn: 'attemptingTurn',
  turnToken: 'turnToken',
  tryTurn: 'tryTurn',
  connection: 'connection',
  connect: 'connect',
  signature: 'signature',
  offerSignal: 'offerSignal',
  offer: 'offer',
  answerSignal: 'answerSignal',
  answer: 'answer',
  rtcConnected: 'rtcConnected',
  disconnect: 'disconnect',
  handshake: 'handshake',
  confirmation: 'confirmation',
  invalidConnection: 'InvalidConnection',
  confirmationFailedBusy: 'confirmationFailedBusy',
  confirmationFailed: 'confirmationFailed'
};
var rtc = {
  error: 'error',
  connect: 'connect',
  close: 'close',
  data: 'data',
  signal: 'signal'
};
var stages = {
  initiator: 'initiator',
  receiver: 'receiver'
};
var lifeCycle = {
  RtcInitiatedEvent: 'RtcInitiatedEvent',
  signatureCheck: 'signatureCheck',
  SocketConnectedEvent: 'SocketConnectedEvent',
  confirmationFailedEvent: 'confirmationFailedEvent',
  confirmationFailedBusyEvent: 'confirmationFailedBusyEvent',
  invalidConnectionEvent: 'invalidConnectionEvent',
  codeDisplay: 'codeDisplay',
  checkNumber: 'checkNumber',
  ConnectionId: 'ConnectionId',
  receiverVersion: 'receiverVersion',
  RtcConnectedEvent: 'RtcConnectedEvent',
  RtcClosedEvent: 'RtcClosedEvent',
  RtcDisconnectEvent: 'RtcDisconnectEvent',
  RtcErrorEvent: 'RtcErrorEvent',
  UsingFallback: 'UsingFallback',
  Failed: 'failed'
};
var communicationTypes = {
  address: 'address',
  signMessage: 'signMessage',
  signTx: 'signTx'
};

var MewConnectCommon =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(MewConnectCommon, _EventEmitter);

  function MewConnectCommon() {
    var _this;

    _classCallCheck(this, MewConnectCommon);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(MewConnectCommon).call(this));
    _this.isBrowser = browserOrNode.isBrowser;
    _this.jsonDetails = {
      stunSrvers: _toConsumableArray(stunServers),
      signals: _objectSpread({}, signal),
      stages: _objectSpread({}, stages),
      lifeCycle: _objectSpread({}, lifeCycle),
      rtc: _objectSpread({}, rtc),
      communicationTypes: _objectSpread({}, communicationTypes),
      connectionCodeSeparator: connectionCodeSeparator,
      version: version$1,
      versions: versions,
      connectionCodeSchemas: connectionCodeSchemas
    };
    return _this;
  }

  _createClass(MewConnectCommon, [{
    key: "isJSON",
    value: function isJSON(arg) {
      try {
        JSON.parse(arg);
        return true;
      } catch (e) {
        return false;
      }
    }
  }], [{
    key: "getBrowserRTC",
    value: function getBrowserRTC() {
      if (typeof window === 'undefined') return null;
      var wrtc = {
        RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
        RTCSessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
        RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate
      };
      if (!wrtc.RTCPeerConnection) return null;
      return wrtc;
    }
  }, {
    key: "checkWebRTCAvailable",
    value: function checkWebRTCAvailable() {
      var doesNotHaveWebRTC = MewConnectCommon.getBrowserRTC() == null;
      return !doesNotHaveWebRTC; // return false
    }
  }, {
    key: "checkBrowser",
    value: function checkBrowser() {
      var browser = detectBrowser.detect();

      if (browser === null) {
        browser = {
          version: {
            split: function split() {
              return [1];
            }
          }
        };
      }

      var version = browser.version.split(0, 1)[0];
      /*
      * Chrome > 23
      * Firefox > 22
      * Opera > 18
      * Safari > 11 (caveats exist)
      * Edge - none (RTCDataChannel not supported)
      * IE - none
      * */

      if (typeof window !== 'undefined') {
        if (browser.name === 'safari') {
          return MewConnectCommon.buildBrowserResult(true, 'Safari', 'version: ' + browser.version);
        } else if (browser.name === 'ie') {
          return MewConnectCommon.buildBrowserResult(true, 'Internet Explorer', '', true);
        } else if (browser.name === 'edge') {
          return MewConnectCommon.buildBrowserResult(true, 'Edge', 'version: ' + browser.version, true);
        } else {
          var name = '';
          var minVersion = 0;

          if (browser.name === 'opera') {
            name = 'Opera';
            minVersion = 18;
          } else if (browser.name === 'firefox') {
            name = 'Firefox';
            minVersion = 22;
          } else if (browser.name === 'chrome') {
            name = 'Chrome';
            minVersion = 23;
          } else {
            return MewConnectCommon.buildBrowserResult(false, '', '', true);
          }

          try {
            if (minVersion >= +version) {
              return MewConnectCommon.buildBrowserResult(true, name, 'version: ' + version);
            } else {
              return MewConnectCommon.buildBrowserResult(false, '', '');
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }, {
    key: "buildBrowserResult",
    value: function buildBrowserResult(status, browser, version, noSupport) {
      return {
        status: status,
        browser: browser,
        version: version,
        noSupport: noSupport || false
      };
    }
  }]);

  return MewConnectCommon;
}(EventEmitter);

var logger = createLogger('MewCrypto');

var MewConnectCrypto =
/*#__PURE__*/
function () {
  function MewConnectCrypto() {
    _classCallCheck(this, MewConnectCrypto);
  }

  _createClass(MewConnectCrypto, [{
    key: "setPrivate",
    value: function setPrivate(pvtKey) {
      this.prvt = Buffer.from(pvtKey, 'hex');
    }
  }, {
    key: "generateMessage",
    value: function generateMessage() {
      return crypto.randomBytes(32).toString('hex');
    } // Not for the Address, but generate them for the connection check

  }, {
    key: "prepareKey",
    value: function prepareKey() {
      this.prvt = this.generatePrivate();
      this.pub = this.generatePublic(this.prvt);
      return {
        pub: this.pub,
        pvt: this.prvt
      };
    }
  }, {
    key: "generatePrivate",
    value: function generatePrivate() {
      var privKey;

      do {
        privKey = crypto.randomBytes(32);
      } while (!secp256k1.privateKeyVerify(privKey));

      return privKey;
    }
  }, {
    key: "generatePublic",
    value: function generatePublic(privKey) {
      var pvt = Buffer.from(privKey, 'hex');
      this.prvt = pvt;
      return secp256k1.publicKeyCreate(pvt);
    }
  }, {
    key: "encrypt",
    value: function encrypt(dataToSend) {
      var publicKeyA = eccrypto.getPublic(this.prvt);
      return new Promise(function (resolve, reject) {
        eccrypto.encrypt(publicKeyA, Buffer.from(dataToSend)).then(function (_initial) {
          resolve(_initial);
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: "decrypt",
    value: function decrypt(dataToSee) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        eccrypto.decrypt(_this.prvt, {
          ciphertext: Buffer.from(dataToSee.ciphertext),
          ephemPublicKey: Buffer.from(dataToSee.ephemPublicKey),
          iv: Buffer.from(dataToSee.iv),
          mac: Buffer.from(dataToSee.mac)
        }).then(function (_initial) {
          var result;

          try {
            if (_this.isJSON(_initial)) {
              var humanRadable = JSON.parse(_initial);

              if (Array.isArray(humanRadable)) {
                result = humanRadable[0];
              } else {
                result = humanRadable;
              }
            } else {
              result = _initial.toString();
            }
          } catch (e) {
            logger.error(e);
          }

          resolve(JSON.stringify(result));
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: "signMessage",
    value: function signMessage(msgToSign) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        try {
          var msg = ethUtils.hashPersonalMessage(ethUtils.toBuffer(msgToSign));
          var signed = ethUtils.ecsign(Buffer.from(msg), Buffer.from(_this2.prvt, 'hex'));
          var combined = Buffer.concat([Buffer.from([signed.v]), Buffer.from(signed.r), Buffer.from(signed.s)]);
          var combinedHex = combined.toString('hex');
          resolve(combinedHex);
        } catch (e) {
          reject(e);
        }
      });
    }
  }, {
    key: "bufferToConnId",
    value: function bufferToConnId(buf) {
      return buf.toString('hex').slice(32);
    }
  }, {
    key: "isJSON",
    value: function isJSON(arg) {
      try {
        JSON.parse(arg);
        return true;
      } catch (e) {
        return false;
      }
    }
  }], [{
    key: "create",
    value: function create() {
      return new MewConnectCrypto();
    }
  }]);

  return MewConnectCrypto;
}();

var debug = debugLogger('MEWconnect:initiator');
var logger$1 = createLogger('MewConnectInitiator');

var MewConnectInitiator =
/*#__PURE__*/
function (_MewConnectCommon) {
  _inherits(MewConnectInitiator, _MewConnectCommon);

  function MewConnectInitiator() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MewConnectInitiator);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(MewConnectInitiator).call(this));
    if (options === null) options = {};
    _this.supportedBrowser = MewConnectCommon.checkBrowser();

    _this.destroyOnUnload();

    _this.p = null;
    _this.qrCodeString = null;
    _this.socketConnected = false;
    _this.connected = false;
    _this.triedTurn = false;
    _this.turnServers = [];
    _this.fallbackTimer = null;
    _this.mewCrypto = options.cryptoImpl || MewConnectCrypto.create();
    _this.rtcOptions = options.rtcOptions || {};
    _this.signalUrl = options.signalUrl || null;
    _this.signals = _this.jsonDetails.signals;
    _this.rtcEvents = _this.jsonDetails.rtc;
    _this.version = _this.jsonDetails.version;
    _this.versions = _this.jsonDetails.versions;
    _this.lifeCycle = _this.jsonDetails.lifeCycle;
    _this.stunServers = _this.jsonDetails.stunSrvers;
    return _this;
  } // Factory function to create instance using default supplied libraries


  _createClass(MewConnectInitiator, [{
    key: "destroyOnUnload",
    // Check if a WebRTC connection exists before a window/tab is closed or refreshed
    // Destroy the connection if one exists
    value: function destroyOnUnload() {
      var _this2 = this;

      if (browserOrNode.isBrowser) {
        window.onunload = window.onbeforeunload = function () {
          if (!!SimplePeer && !SimplePeer.destroyed) {
            _this2.rtcDestroy();
          }
        };
      }
    }
  }, {
    key: "getSocketConnectionState",
    // Returns a boolean indicating whether the socket connection exists and is active
    value: function getSocketConnectionState() {
      return this.socketConnected;
    } // Returns a boolean indicating whether the WebRTC connection exists and is active

  }, {
    key: "getConnectonState",
    value: function getConnectonState() {
      return this.connected;
    } // can be used to listen to specific events, especially those that pass data

  }, {
    key: "uiCommunicator",
    value: function uiCommunicator(event, data) {
      this.emit(event, data);
      this.emitStatus(event);
    } // special status emitter to allow simple listening of various statuses in one listener

  }, {
    key: "emitStatus",
    value: function emitStatus(event) {
      this.emit('status', event);
    } // Emit/Provide the details used in creating the QR Code

  }, {
    key: "displayCode",
    value: function displayCode(data) {
      debug('handshake', data);
      this.socketKey = data;
      var separator = this.jsonDetails.connectionCodeSeparator;
      var qrCodeString = this.version + separator + data + separator + this.connId;
      this.qrCodeString = qrCodeString;
      this.uiCommunicator(this.lifeCycle.codeDisplay, qrCodeString);
      this.uiCommunicator(this.lifeCycle.checkNumber, data);
      this.uiCommunicator(this.lifeCycle.ConnectionId, this.connId);
    } // ===================== [Start] WebSocket Communication Methods and Handlers ========================
    // The initial method called to initiate the exchange that can create a WebRTC connection

  }, {
    key: "regenerateCode",
    value: function () {
      var _regenerateCode = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.signalUrl === null)) {
                  _context.next = 2;
                  break;
                }

                throw Error('regenerateCode called before initial code generation');

              case 2:
                this.socketDisconnect();
                this.initiatorStart(this.signalUrl);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function regenerateCode() {
        return _regenerateCode.apply(this, arguments);
      };
    }()
  }, {
    key: "useFallback",
    value: function () {
      var _useFallback = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.socketEmit(this.signals.tryTurn, {
                  connId: this.connId
                });

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function useFallback() {
        return _useFallback.apply(this, arguments);
      };
    }() // Initalize a websocket connection with the signal server

  }, {
    key: "initiatorStart",
    value: function () {
      var _initiatorStart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(url) {
        var toSign, options;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.signalUrl === null) {
                  this.signalUrl = url;
                }

                this.keys = this.mewCrypto.prepareKey();
                toSign = this.mewCrypto.generateMessage();
                _context3.next = 5;
                return this.mewCrypto.signMessage(this.keys.pvt.toString('hex'));

              case 5:
                this.signed = _context3.sent;
                this.connId = this.mewCrypto.bufferToConnId(this.keys.pub);
                this.displayCode(this.keys.pvt.toString('hex'));
                this.uiCommunicator(this.lifeCycle.signatureCheck);
                options = {
                  query: {
                    stage: 'initiator',
                    signed: this.signed,
                    message: toSign,
                    connId: this.connId
                  },
                  transports: ['websocket', 'polling', 'flashsocket'],
                  secure: true
                };
                this.socketManager = io(url, options);
                this.socket = this.socketManager.connect();
                this.initiatorConnect(this.socket);

              case 13:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function initiatorStart(_x) {
        return _initiatorStart.apply(this, arguments);
      };
    }() // ------------- WebSocket Communication Methods and Handlers ------------------------------
    // ----- Wrapper around Socket.IO methods
    // socket.emit wrapper

  }, {
    key: "socketEmit",
    value: function socketEmit(signal, data) {
      this.socket.binary(false).emit(signal, data);
    } // socket.disconnect wrapper

  }, {
    key: "socketDisconnect",
    value: function socketDisconnect() {
      this.socket.disconnect();
    } // socket.on listener registration wrapper

  }, {
    key: "socketOn",
    value: function socketOn(signal, func) {
      this.socket.on(signal, func);
    } // ----- Setup handlers for communication with the signal server

  }, {
    key: "initiatorConnect",
    value: function initiatorConnect(socket) {
      var _this3 = this;

      debug('INITIATOR CONNECT');
      this.uiCommunicator(this.lifeCycle.SocketConnectedEvent);
      this.socket.on(this.signals.connect, function () {
        debug('SOCKET CONNECTED');
        _this3.socketConnected = true;
      });
      this.socketOn(this.signals.confirmation, this.sendOffer.bind(this)); // response

      this.socketOn(this.signals.answer, this.recieveAnswer.bind(this));
      this.socketOn(this.signals.confirmationFailedBusy, this.busyFailure.bind(this));
      this.socketOn(this.signals.confirmationFailed, this.confirmationFailure.bind(this));
      this.socketOn(this.signals.invalidConnection, this.invalidFailure.bind(this));
      this.socketOn(this.signals.disconnect, this.socketDisconnectHandler.bind(this));
      this.socketOn(this.signals.attemptingTurn, this.willAttemptTurn.bind(this));
      this.socketOn(this.signals.turnToken, this.usingTurnFallback.bind(this));
      return socket;
    } // ----- Socket Event handlers
    // Handle Socket Disconnect Event

  }, {
    key: "socketDisconnectHandler",
    value: function socketDisconnectHandler(reason) {
      debug(reason);
      this.socketConnected = false;
    } // Handle Socket Attempting Turn informative signal
    // Provide Notice that initial WebRTC connection failed and the fallback method will be used

  }, {
    key: "willAttemptTurn",
    value: function willAttemptTurn() {
      debug('TRY TURN CONNECTION');
      this.triedTurn = true;
      this.uiCommunicator(this.lifeCycle.UsingFallback);
    } // Handle Socket event to initiate turn connection
    // Handle Receipt of TURN server details, and begin a WebRTC connection attempt using TURN

  }, {
    key: "usingTurnFallback",
    value: function usingTurnFallback(data) {
      this.retryViaTurn(data);
    } // ----- Failure Handlers
    // Handle Failure due to an attempt to join a connection with two existing endpoints

  }, {
    key: "busyFailure",
    value: function busyFailure() {
      this.uiCommunicator(this.lifeCycle.Failed, this.lifeCycle.confirmationFailedBusyEvent);
      debug('confirmation Failed: Busy');
    } // Handle Failure due to no opposing peer existing

  }, {
    key: "invalidFailure",
    value: function invalidFailure() {
      this.uiCommunicator(this.lifeCycle.Failed, this.lifeCycle.invalidConnectionEvent);
      debug('confirmation Failed: no opposite peer found');
    } // Handle Failure due to the handshake/ verify details being invalid for the connection ID

  }, {
    key: "confirmationFailure",
    value: function confirmationFailure() {
      this.uiCommunicator(this.lifeCycle.Failed, this.lifeCycle.confirmationFailedEvent);
      debug('confirmation Failed: invalid confirmation');
    } // =============== [End] WebSocket Communication Methods and Handlers ========================
    // ======================== [Start] WebRTC Communication Methods =============================
    // ----- WebRTC Setup Methods
    // A connection pair exists, create and send WebRTC OFFER

  }, {
    key: "sendOffer",
    value: function () {
      var _sendOffer = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(data) {
        var plainTextVersion;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.mewCrypto.decrypt(data.version);

              case 2:
                plainTextVersion = _context4.sent;
                this.peerVersion = plainTextVersion;
                this.uiCommunicator(this.lifeCycle.receiverVersion, plainTextVersion);
                debug('sendOffer', data);
                this.initiatorStartRTC(this.socket);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function sendOffer(_x2) {
        return _sendOffer.apply(this, arguments);
      };
    }() // Handle the WebRTC ANSWER from the opposite (mobile) peer

  }, {
    key: "recieveAnswer",
    value: function () {
      var _recieveAnswer = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(data) {
        var plainTextOffer;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return this.mewCrypto.decrypt(data.data);

              case 3:
                plainTextOffer = _context5.sent;
                this.rtcRecieveAnswer({
                  data: plainTextOffer
                });
                _context5.next = 10;
                break;

              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5["catch"](0);
                logger$1.error(_context5.t0);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[0, 7]]);
      }));

      return function recieveAnswer(_x3) {
        return _recieveAnswer.apply(this, arguments);
      };
    }()
  }, {
    key: "rtcRecieveAnswer",
    value: function rtcRecieveAnswer(data) {
      this.uiCommunicator('AnswerReceived');

      if (this.p.destroyed) {
        this.initiatorStartRTC(this.socket, this.simpleOptions);
        this.p.signal(JSON.parse(data.data));
        this.setCancelFallbackTimer();
      } else {
        this.p.signal(JSON.parse(data.data));
        this.setCancelFallbackTimer();
      }
    }
  }, {
    key: "initiatorStartRTC",
    value: function initiatorStartRTC(socket) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.rtcOptions;
      var servers = options.servers || this.stunServers;
      var signalListener = this.initiatorSignalListener(socket, servers);
      var suppliedOptions = this.rtcOptions || {};
      var defaultOptions = {
        initiator: true,
        config: {
          iceServers: servers
        }
      };
      this.simpleOptions = _objectSpread({}, defaultOptions, suppliedOptions);
      debug("initiatorStartRTC - options: ".concat(this.simpleOptions));
      this.p = new SimplePeer(this.simpleOptions);
      this.p.on(this.rtcEvents.signal, signalListener.bind(this));
      this.p.on(this.rtcEvents.error, this.onError.bind(this));
      this.p.on(this.rtcEvents.connect, this.onConnect.bind(this));
      this.p.on(this.rtcEvents.close, this.onClose.bind(this));
      this.p.on(this.rtcEvents.data, this.onData.bind(this));
      this.uiCommunicator(this.lifeCycle.RtcInitiatedEvent);
      debug('simple peer', this.p);
    }
  }, {
    key: "initiatorSignalListener",
    value: function initiatorSignalListener(socket, options) {
      var _this4 = this;

      return (
        /*#__PURE__*/
        function () {
          var _ref = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee6(data) {
            var encryptedSend;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.prev = 0;
                    debug('SIGNAL', JSON.stringify(data));
                    _context6.next = 4;
                    return _this4.mewCrypto.encrypt(JSON.stringify(data));

                  case 4:
                    encryptedSend = _context6.sent;

                    _this4.uiCommunicator('OfferCreated');

                    _this4.socketEmit(_this4.signals.offerSignal, {
                      data: encryptedSend,
                      connId: _this4.connId,
                      options: options.servers
                    });

                    _context6.next = 12;
                    break;

                  case 9:
                    _context6.prev = 9;
                    _context6.t0 = _context6["catch"](0);
                    logger$1.error(_context6.t0);

                  case 12:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6, this, [[0, 9]]);
          }));

          return function (_x4) {
            return _ref.apply(this, arguments);
          };
        }()
      );
    } // ----- WebRTC Communication Event Handlers

  }, {
    key: "onConnect",
    value: function onConnect() {
      var _this5 = this;

      this.setCancelFallbackTimer(true);
      debug("CONNECT", "ok");
      this.connected = true;
      this.socketEmit(this.signals.rtcConnected, this.connId);
      this.socketDisconnect();
      setTimeout(function () {
        _this5.uiCommunicator(_this5.lifeCycle.RtcConnectedEvent);
      }, 100);
    }
  }, {
    key: "onData",
    value: function () {
      var _onData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(data) {
        var decryptedData, parsed;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                debug('DATA RECEIVED', data.toString());
                _context7.prev = 1;

                if (!this.isJSON(data)) {
                  _context7.next = 8;
                  break;
                }

                _context7.next = 5;
                return this.mewCrypto.decrypt(JSON.parse(data.toString()));

              case 5:
                decryptedData = _context7.sent;
                _context7.next = 11;
                break;

              case 8:
                _context7.next = 10;
                return this.mewCrypto.decrypt(JSON.parse(data.toString()));

              case 10:
                decryptedData = _context7.sent;

              case 11:
                if (this.isJSON(decryptedData)) {
                  parsed = JSON.parse(decryptedData);
                  debug('DECRYPTED DATA RECEIVED', parsed);
                  this.emit(parsed.type, parsed.data);
                } else {
                  debug('DECRYPTED DATA RECEIVED', decryptedData);
                  this.emit(decryptedData.type, decryptedData.data);
                }

                _context7.next = 19;
                break;

              case 14:
                _context7.prev = 14;
                _context7.t0 = _context7["catch"](1);
                logger$1.error(_context7.t0);
                debug('onData ERROR: data=', data);
                debug('onData ERROR: data.toString()=', data.toString());

              case 19:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[1, 14]]);
      }));

      return function onData(_x5) {
        return _onData.apply(this, arguments);
      };
    }()
  }, {
    key: "onClose",
    value: function onClose(data) {
      debug('WRTC CLOSE', data);
      this.connected = false;
      this.uiCommunicator(this.lifeCycle.RtcClosedEvent);
    }
  }, {
    key: "onError",
    value: function onError(err) {
      debug(err.code);
      debug('WRTC ERROR');
      debug('error', err);

      if (!this.triedTurn && !this.connected) {
        this.useFallback();
      }

      this.uiCommunicator(this.lifeCycle.RtcErrorEvent);
    } // ----- WebRTC Communication Methods

  }, {
    key: "sendRtcMessageClosure",
    value: function sendRtcMessageClosure(type, msg) {
      var _this6 = this;

      return function () {
        debug("[SEND RTC MESSAGE Closure] type:  ".concat(type, ",  message:  ").concat(msg));

        _this6.rtcSend(JSON.stringify({
          type: type,
          data: msg
        }));
      };
    }
  }, {
    key: "sendRtcMessage",
    value: function sendRtcMessage(type, msg) {
      debug("[SEND RTC MESSAGE] type:  ".concat(type, ",  message:  ").concat(msg));
      this.rtcSend(JSON.stringify({
        type: type,
        data: msg
      }));
    }
  }, {
    key: "disconnectRTCClosure",
    value: function disconnectRTCClosure() {
      var _this7 = this;

      return function () {
        debug('DISCONNECT RTC Closure');

        _this7.uiCommunicator(_this7.lifeCycle.RtcDisconnectEvent);

        _this7.rtcDestroy();

        _this7.instance = null;
        _this7.connected = false;
      };
    }
  }, {
    key: "disconnectRTC",
    value: function disconnectRTC() {
      debug('DISCONNECT RTC');
      this.uiCommunicator(this.lifeCycle.RtcDisconnectEvent);
      this.rtcDestroy();
      this.instance = null;
      this.connected = false;
    }
  }, {
    key: "rtcSend",
    value: function () {
      var _rtcSend = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(arg) {
        var encryptedSend;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!(typeof arg === 'string')) {
                  _context8.next = 6;
                  break;
                }

                _context8.next = 3;
                return this.mewCrypto.encrypt(arg);

              case 3:
                encryptedSend = _context8.sent;
                _context8.next = 9;
                break;

              case 6:
                _context8.next = 8;
                return this.mewCrypto.encrypt(JSON.stringify(arg));

              case 8:
                encryptedSend = _context8.sent;

              case 9:
                debug('SENDING RTC');
                this.p.send(JSON.stringify(encryptedSend));

              case 11:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      return function rtcSend(_x6) {
        return _rtcSend.apply(this, arguments);
      };
    }()
  }, {
    key: "rtcDestroy",
    value: function rtcDestroy() {
      if (this.p !== null) {
        this.p.destroy();
        this.p = null;
        this.socketConnected = false;
        this.connected = false;
        this.signalUrl = null;
        this.turnServers = [];
        this.fallbackTimer = [];
      }
    }
  }, {
    key: "rtcEmitError",
    value: function rtcEmitError(msg) {
      if (this.p !== null) {
        this.p.destroy(msg);
      }
    } // ------------------ WebRTC Communication TURN Fallback ------------------
    // ------ TURN Fallback timeout trigger ------

  }, {
    key: "setCancelFallbackTimer",
    value: function setCancelFallbackTimer(cancel) {
      var _this8 = this;

      if (this.fallbackTimer || cancel) {
        debug("Cancelling fallback timer");
        clearTimeout(this.fallbackTimer);
      } else {
        this.fallbackTimer = setTimeout(function () {
          debug("triggering fallback for connection ID: ".concat(_this8.connId));

          _this8.socketEmit(_this8.signals.tryTurn, {
            connId: _this8.connId,
            data: null
          });

          _this8.rtcEmitError();
        }, 5000);
      }
    } // ------ Fallback Initiator/Handler ------
    // Fallback Step if initial webRTC connection attempt fails.
    // Retries setting up the WebRTC connection using TURN

  }, {
    key: "retryViaTurn",
    value: function retryViaTurn(data) {
      this.setCancelFallbackTimer(true);
      debug('Retrying via TURN');
      var options = {
        servers: data.data
      };
      this.initiatorStartRTC(this.socket, options);
    } // ======================== [End] WebRTC Communication Methods =============================

  }], [{
    key: "init",
    value: function init(options) {
      return new MewConnectInitiator(options);
    }
  }, {
    key: "checkBrowser",
    value: function checkBrowser() {
      return MewConnectCommon.checkBrowser();
    }
  }, {
    key: "checkWebRTCAvailable",
    value: function checkWebRTCAvailable() {
      return MewConnectCommon.checkWebRTCAvailable();
    }
  }]);

  return MewConnectInitiator;
}(MewConnectCommon);

// INITIATOR CLIENT
var index = {
  Crypto: MewConnectCrypto,
  Initiator: MewConnectInitiator
};

module.exports = index;
