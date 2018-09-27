// const logging = require('logging')
const debugLogger = require('debug');
const io = require('socket.io-client');
const EventEmitter = require('events').EventEmitter;
const MewConnectCrypto = require('../../dist/index.js').Crypto;
// const logger = logging.default('MewConnectReceiver')
const isBrowser = require('socket.io-client');
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');
const {
  versions,
  connectionCodeSchemas,
  connectionCodeSeparator,
  signal,
  rtc,
  stages,
  lifeCycle,
  communicationTypes
} = require('../../src/constants');
const { version, stunServers } = require('../../src/config');
const debug = debugLogger('MEWconnect:receiver');

export default class MewConnectReceiver extends EventEmitter {
  constructor(
    options = {}
  ) {
    super();
    this.onlyFallback = options.onlyFallback || false;
    this.jsonDetails = {
      stunSrvers: [...stunServers],
      signals: {
        ...signal
      },
      stages: {
        ...stages
      },
      lifeCycle: {
        ...lifeCycle
      },
      rtc: {
        ...rtc
      },
      communicationTypes: {
        ...communicationTypes
      },
      connectionCodeSeparator,
      version,
      versions,
      connectionCodeSchemas
    };

    this.p = null;
    this.qrCodeString = null;
    this.socketConnected = false;
    this.connected = false;
    this.signalUrl = null;
    this.turnServers = [];

    this.io = io;
    this.Peer = SimplePeer;
    this.mewCrypto = MewConnectCrypto.create();
    this.nodeWebRTC = wrtc;

    this.signals = this.jsonDetails.signals;
    this.rtcEvents = this.jsonDetails.rtc;
    this.version = this.jsonDetails.version;
    this.versions = this.jsonDetails.versions;
    this.lifeCycle = this.jsonDetails.lifeCycle;
    this.stunServers = this.jsonDetails.stunSrvers;
  }

  isJSON(arg) {
    try {
      JSON.parse(arg);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Helper method for parsing the connection details string (data in the QR Code)
  parseConnectionCodeString(str) {
    try {
      const connParts = str.split(this.jsonDetails.connectionCodeSeparator);
      return {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };
    } catch (e) {
      debug(e);
    }
  }

  async useFallback() {
    this.socketEmit(this.signals.tryTurn, { connId: this.connId });
  }

  // ===================== [Start] WebSocket Communication Methods and Handlers ====================

  // ------------- WebSocket Communication Methods and Handlers ------------------------------

  uiCommunicator(event, data) {
    this.emit(event, data);
  }

  // ----- Wrapper around Socket.IO methods
  // socket.emit wrapper
  socketEmit(signal, data) {
    this.socket.binary(false).emit(signal, data);
  }

  // socket.disconnect wrapper
  socketDisconnect() {
    this.socket.disconnect();
  }

  // socket.on wrapper
  socketOn(signal, func) {
    if (typeof func !== 'function') debug('not a function?', signal); // one of the handlers is/was not initializing properly
    this.socket.on(signal, func);
  }

  // ----- Setup handlers for communication with the signal server
  async receiverStart(url, params) {
    try {
      // Set the private key sent via a QR code scan
      this.mewCrypto.setPrivate(params.key);
      const signed = await this.mewCrypto.signMessage(params.key);
      this.connId = params.connId;
      const options = {
        query: {
          signed,
          connId: this.connId,
          stage: 'receiver'
        },
        secure: true
      };
      this.socketManager = this.io(url, options);
      this.socket = this.socketManager.connect();

      // identity and locate an opposing peer
      this.socketOn(this.signals.handshake, this.socketHandshake.bind(this));
      // Handle the WebRTC OFFER from the opposite (web) peer
      this.socketOn(this.signals.offer, this.processOfferReceipt.bind(this));
      this.socketOn(
        this.signals.confirmationFailedBusy,
        this.busyFailure.bind(this)
      );
      this.socketOn(
        this.signals.confirmationFailed,
        this.confirmationFailure.bind(this)
      );
      this.socketOn(
        this.signals.invalidConnection,
        this.invalidFailure.bind(this)
      );
      this.socketOn(
        this.signals.disconnect,
        this.socketDisconnectHandler.bind(this)
      );
      this.socketOn(
        this.signals.attemptingTurn,
        this.willAttemptTurn.bind(this)
      );
      // Handle Receipt of TURN server details, and begin a WebRTC connection attempt using TURN
      this.socketOn(this.signals.turnToken, this.retryViaTurn.bind(this));
    } catch (e) {
      debug(e);
    }
  }

  async socketHandshake() {
    expect(true).toBeTruthy();
    debug('socketHandshake');
    this.signed = await this.mewCrypto.signMessage(
      this.mewCrypto.prvt.toString('hex')
    );
    this.uiCommunicator('signatureCheck', this.signed);
    const encryptedVersion = await this.mewCrypto.encrypt(this.version);
    setTimeout(() => {
      this.socketEmit(this.signals.signature, {
        signed: this.signed,
        connId: this.connId,
        version: encryptedVersion
      });
    }, 200);

  }

  // ----- Socket Event handlers

  // Handle Socket Disconnect Event
  socketDisconnectHandler(reason) {
    debug(reason);
    this.socketConnected = false;
  }

  // Handle Socket Attempting Turn informative signal
  // Provide Notice that initial WebRTC connection failed and the fallback method will be used
  willAttemptTurn() {
    debug('TRY TURN CONNECTION');
    this.uiCommunicator(this.lifeCycle.UsingFallback);
  }

  // Handle Socket event to initiate turn connection
  // Handle Receipt of TURN server details, and begin a WebRTC connection attempt using TURN
  attemptingTurn(data) {
    this.retryViaTurn(data);
  }

  // ----- Failure Handlers

  // Handle Failure due to an attempt to join a connection with two existing endpoints
  busyFailure() {
    this.uiCommunicator(
      this.lifeCycle.Failed,
      this.lifeCycle.confirmationFailedBusyEvent
    );
    debug('confirmation Failed: Busy');
  }

  // Handle Failure due to no opposing peer existing
  invalidFailure() {
    this.uiCommunicator(
      this.lifeCycle.Failed,
      this.lifeCycle.invalidConnectionEvent
    );
    debug('confirmation Failed: no opposite peer found');
  }

  // Handle Failure due to the handshake/ verify details being invalid for the connection ID
  confirmationFailure() {
    this.uiCommunicator(
      this.lifeCycle.Failed,
      this.lifeCycle.confirmationFailedEvent
    );
    debug('confirmation Failed: invalid confirmation');
  }

  // =============== [End] WebSocket Communication Methods and Handlers ========================

  // ======================== [Start] WebRTC Communication Methods =============================

  // ----- WebRTC Setup Methods

  async processOfferReceipt(data) {
    if(this.onlyFallback) return;
    try {
      const decryptedOffer = await this.mewCrypto.decrypt(data.data);

      const decryptedData = {
        data: decryptedOffer
      };
      this.receiveOffer(decryptedData);
    } catch (e) {
      debug(e);
    }
  }

  receiveOffer(data, servers) {
    debug('Receive Offer');
    // const webRtcConfig = data.options || {};
    // const webRtcServers = webRtcConfig.servers || this.stunServers;

    const simpleOptions = {
      initiator: false,
      trickle: true,
      iceTransportPolicy: 'all',
      // config: {
      //   iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
      // }
    };

    if(servers) simpleOptions.config = {iceServers: servers};
    this.p = new this.Peer(simpleOptions);
    this.p.signal(JSON.parse(data.data));
    this.p.on(this.rtcEvents.error, this.onError.bind(this));
    this.p.on(this.rtcEvents.connect, this.onConnect.bind(this));
    this.p.on(this.rtcEvents.close, this.onClose.bind(this));
    this.p.on(this.rtcEvents.data, this.onData.bind(this));
    this.p.on('signal', this.onSignal.bind(this));
  }

  // ----- WebRTC Communication Event Handlers

  async onSignal(data) {
    debug('SIGNAL: ', JSON.stringify(data));
    const encryptedSend = await this.mewCrypto.encrypt(JSON.stringify(data));

    // setTimeout(() => {
      this.socketEmit(this.signals.answerSignal, {
        data: encryptedSend,
        connId: this.connId
      });
    // }, 100);
    this.uiCommunicator('RtcSignalEvent');
  }

  onConnect() {
    debug('CONNECTED');
    this.uiCommunicator('RtcConnectedEvent');
      this.socketEmit(this.signals.rtcConnected, this.connId);
      this.tryTurn = false;
      this.socketDisconnect();
  }

  async onData(data) {
    debug('DATA RECEIVED', data.toString());
    try {
      let decryptedData;
      if (this.isJSON(data)) {
        decryptedData = await this.mewCrypto.decrypt(
          JSON.parse(data.toString())
        );
      } else {
        decryptedData = await this.mewCrypto.decrypt(
          JSON.parse(data.toString())
        );
      }
      if (this.isJSON(decryptedData)) {
        this.applyDatahandlers(JSON.parse(decryptedData));
      } else {
        this.applyDatahandlers(decryptedData);
      }
    } catch (e) {
      debug(e);
      logger('onData ERROR: data=', data);
      logger('onData ERROR: data.toString()=', data.toString());
    }
  }

  onClose() {
    debug('WRTC CLOSE');
    this.uiCommunicator('RtcClosedEvent');
    if (!this.triedTurn && this.tryTurn) {
      this.attemptTurnConnect();
    }
  }

  onError(err) {
    debug(err.code);
    debug('WRTC ERROR');
    debug(err);
  }

  // ----- WebRTC Communication Methods
  sendRtcMessage(type, msg) {
    return () => {
      this.rtcSend(JSON.stringify({ type: type, data: msg }));
    };
  }

  sendRtcMessageResponse(type, msg) {
    this.rtcSend(JSON.stringify({ type: type, data: msg }));
  }

  disconnectRTC() {
    return () => {
      this.uiCommunicator('RtcDisconnectEvent');
      this.rtcDestroy();
    };
  }

  async rtcSend(arg) {
    let encryptedSend;
    if (typeof arg === 'string') {
      encryptedSend = await this.mewCrypto.encrypt(arg);
    } else {
      encryptedSend = await this.mewCrypto.encrypt(JSON.stringify(arg));
    }
    this.p.send(JSON.stringify(encryptedSend));
  }

  rtcDestroy() {
    this.p.destroy();
  }

  rtcDestroyError() {
    this.p.destroy('Intential Error');
  }

  // ----- WebRTC Communication TURN Fallback Initiator/Handler
  // Fallback Step if initial webRTC connection attempt fails.
  // Retries setting up the WebRTC connection using TURN
  attemptTurnConnect() {
    this.triedTurn = true;
    setTimeout(() => {
      this.socketEmit(this.signals.tryTurn, { connId: this.connId, cont: true });
    }, 100);
  }

  retryViaTurn(data) {
    debug('Retrying via TURN');
    setTimeout(() => {
      const options = {
        signalListener: this.initiatorSignalListener,
        webRtcConfig: {
          servers: data.data
        }
      };
      this.receiveOffer(options);
    }, 100);

  }

  // ======================== [End] WebRTC Communication Methods =============================
}

// module.exports = MewConnectReceiver
