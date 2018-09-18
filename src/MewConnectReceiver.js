import createLogger from 'logging'
import io from 'socket.io-client'
import SimplePeer from 'simple-peer'
import MewConnectCrypto from './MewConnectCrypto'
import MewConnectCommon from './MewConnectCommon'

const logger = createLogger('MewConnectReceiver')

class MewConnectReceiver extends MewConnectCommon {
  /**
   *
   * @param uiCommunicatorFunc
   * @param loggingFunc
   * @param additionalLibs
   */
  constructor(uiCommunicatorFunc, loggingFunc, additionalLibs) {
    super(uiCommunicatorFunc, loggingFunc)
    if (this.isBrowser) {
      // eslint-disable-next-line no-undef
      window.onunload = window.onbeforeunload = () => {
        if (!!this.Peer && !this.Peer.destroyed) {
          this.rtcDestroy()
        }
      }
    }

    this.p = null
    this.tryTurn = true
    this.triedTurn = false

    this.io = additionalLibs.io || io

    this.signals = this.jsonDetails.signals
    this.rtcEvents = this.jsonDetails.rtc
    this.version = this.jsonDetails.version
    this.versions = this.jsonDetails.versions

    // logger.debug(this.versions); // todo remove dev item
    // Library used to facilitate the WebRTC connection and subsequent communications
    this.Peer = additionalLibs.wrtc || SimplePeer
    this.nodeWebRTC = additionalLibs.webRTC || null

    // Initial (STUN) server set used to initiate a WebRTC connection
    this.stunServers = [
      { url: 'stun:global.stun.twilio.com:3478?transport=udp' }
    ]
    // Initialization of the array to hold the TURN
    // server information if the initial connection attempt fails
    this.turnServers = []

    // Object with specific methods used in relation to cryptographic operations
    this.mewCrypto = additionalLibs.cryptoImpl || MewConnectCrypto.create()
    // this.mewCrypto = additionalLibs.cryptoImpl || new MewConnect.Crypto({
    //     eccrypto,
    //     crypto,
    //     secp256k1,
    //     ethUtils,
    //     buffer
    //   });
  }

  /**
   * Helper method for parsing the connection details string (data in the QR Code)
   */
  // eslint-disable-next-line consistent-return
  parseConnectionCodeString(str) {
    try {
      const connParts = str.split(this.jsonDetails.connectionCodeSeparator)
      if (this.versions.indexOf(connParts[0].trim()) > -1) {
        return {
          connId: connParts[2].trim(),
          key: connParts[1].trim(),
          version: connParts[0].trim()
        }
      }
      return {
        connId: connParts[1].trim(),
        key: connParts[0].trim()
      }
    } catch (e) {
      logger.error(e)
    }
  }

  // ////////////// Initialize Communication Process //////////////////////////////

  /**
   * The reply method called to continue the exchange that can create a WebRTC connection
   */
  async receiverStart(url, params) {
    try {
      // Set the private key sent via a QR code scan
      this.mewCrypto.setPrivate(params.key)
      const signed = await this.mewCrypto.signMessage(params.key)
      this.connId = params.connId
      const options = {
        query: {
          signed,
          connId: this.connId,
          stage: 'receiver'
        },
        secure: true
      }
      this.socketManager = this.io(url, options)
      this.socket = this.socketManager.connect()

      // identity and locate an opposing peer
      this.socketOn(this.signals.handshake, this.socketHandshake.bind(this))
      // Handle the WebRTC OFFER from the opposite (web) peer
      this.socketOn(this.signals.offer, this.processOfferReceipt.bind(this))
      // Handle Failure due to no opposing peer existing
      this.socketOn(this.signals.invalidConnection, () => {
        this.uiCommunicator('InvalidConnection')
      })
      // Handle Receipt of TURN server details, and begin a WebRTC connection attempt using TURN
      this.socketOn(this.signals.turnToken, data => {
        this.retryViaTurn(data)
      })
    } catch (e) {
      logger.error(e)
    }
  }

  async socketHandshake() {
    this.signed = await this.mewCrypto.signMessage(
      this.mewCrypto.prvt.toString('hex')
    )
    this.uiCommunicator('signatureCheck', this.signed)
    const encryptedVersion = await this.mewCrypto.encrypt(this.version)
    this.socketEmit(this.signals.signature, {
      signed: this.signed,
      connId: this.connId,
      version: encryptedVersion
    })
  }

  // Wrapper around socket.emit method
  socketEmit(signal, data) {
    this.socket.emit(signal, data)
  }

  // Wrapper around socket.disconnect method
  socketDisconnect() {
    this.socket.disconnect()
  }

  // Wrapper around socket.on listener registration method
  socketOn(signal, func) {
    if (typeof func !== 'function') logger.error('not a function?', signal) // one of the handlers is/was not initializing properly
    this.socket.on(signal, func)
  }

  // /////////////////////////////////////////////////////////////////////////////////////////////

  // //////////////////////// WebRTC Communication Related ///////////////////////////////////////

  // ////////////// WebRTC Communication Setup Methods ///////////////////////////////////////////

  /**
   * Processes the WebRTC OFFER
   */
  async processOfferReceipt(data) {
    try {
      const decryptedOffer = await this.mewCrypto.decrypt(data.data)
      const decryptedData = {
        data: decryptedOffer
      }
      this.receiveOffer(decryptedData)
    } catch (e) {
      logger.error(e)
    }
  }

  /**
   * creates the WebRTC ANSWER (Receives the answer created by the webrtc lib) and
   * emits it along with the connection ID to the signal server
   */
  async onSignal(data) {
    this.logger('SIGNAL: ', JSON.stringify(data))
    const encryptedSend = await this.mewCrypto.encrypt(JSON.stringify(data))
    this.socketEmit(this.signals.answerSignal, {
      data: encryptedSend,
      connId: this.connId
    })
    this.uiCommunicator('RtcSignalEvent')
  }

  /**
   * Initiates one side (recipient peer) of the WebRTC connection
   */
  receiveOffer(data) {
    this.logger(data)
    const webRtcConfig = data.options || {}
    const webRtcServers = webRtcConfig.servers || this.stunServers

    const simpleOptions = {
      initiator: false,
      trickle: false,
      reconnectTimer: 100,
      iceTransportPolicy: 'relay',
      config: {
        iceServers: webRtcServers
      }
    }

    if (!this.isBrowser && this.nodeWebRTC) {
      simpleOptions.wrtc = this.nodeWebRTC
    }
    this.p = new this.Peer(simpleOptions)
    this.p.signal(JSON.parse(data.data))
    this.p.on(this.rtcEvents.error, this.onError.bind(this))
    this.p.on(this.rtcEvents.connect, this.onConnect.bind(this))
    this.p.on(this.rtcEvents.close, this.onClose.bind(this))
    this.p.on(this.rtcEvents.data, this.onData.bind(this))
    this.p.on('signal', this.onSignal.bind(this))
  }

  // ////////////// WebRTC Communication Event Handlers //////////////////////////////

  /**
   * Emitted when the  webRTC connection is established
   */
  onConnect() {
    this.logger('CONNECTED')
    this.uiCommunicator('RtcConnectedEvent')
    this.socketEmit(this.signals.rtcConnected, this.connId)
    this.tryTurn = false
    this.socketDisconnect()
  }

  /**
   * Emitted when the data is received via the webRTC connection
   */
  async onData(data) {
    this.logger('DATA RECEIVED', data.toString())
    try {
      let decryptedData
      if (this.isJSON(data)) {
        decryptedData = await this.mewCrypto.decrypt(
          JSON.parse(data.toString())
        )
      } else {
        decryptedData = await this.mewCrypto.decrypt(
          JSON.parse(data.toString())
        )
      }
      if (this.isJSON(decryptedData)) {
        this.applyDatahandlers(JSON.parse(decryptedData))
      } else {
        this.applyDatahandlers(decryptedData)
      }
    } catch (e) {
      logger.error(e)
      this.logger('peer2 ERROR: data=', data)
      this.logger('peer2 ERROR: data.toString()=', data.toString())
    }
  }

  /**
   * Emitted when one end of the webRTC connection closes
   */
  onClose() {
    this.logger('WRTC CLOSE')
    this.uiCommunicator('RtcClosedEvent')
    if (!this.triedTurn && this.tryTurn) {
      this.attemptTurnConnect()
    }
  }

  /**
   * Emitted when there is an error with the webRTC connection
   */
  onError(err) {
    logger.error('WRTC ERROR')
    logger.error(err)
  }

  // /////////////////////////// WebRTC Communication Methods ///////////////////////////////////
  /**
   * sends a hardcoded message through the rtc connection
   */
  testRTC(msg) {
    return () => {
      this.rtcSend(JSON.stringify({ type: 2, text: msg }))
    }
  }

  /**
   * prepare a message to send through the rtc connection,
   * using a closure to hold off calling the rtc object until after it is created
   */
  sendRtcMessage(type, msg) {
    return () => {
      this.rtcSend(JSON.stringify({ type, data: msg }))
    }
  }

  /**
   * prepare a message to send through the rtc connection
   */
  sendRtcMessageResponse(type, msg) {
    this.rtcSend(JSON.stringify({ type, data: msg }))
  }

  /**
   * Disconnect the current RTC connection
   */
  disconnectRTC() {
    return () => {
      this.uiCommunicator('RtcDisconnectEvent')
      this.rtcDestroy()
    }
  }

  /**
   * send a message through the rtc connection
   */
  async rtcSend(arg) {
    let encryptedSend
    if (typeof arg === 'string') {
      encryptedSend = await this.mewCrypto.encrypt(arg)
    } else {
      encryptedSend = await this.mewCrypto.encrypt(JSON.stringify(arg))
    }
    this.p.send(JSON.stringify(encryptedSend))
  }

  /**
   * Disconnect/Destroy the current RTC connection
   */
  rtcDestroy() {
    this.p.destroy()
  }

  // ////////////// WebRTC Communication TURN Fallback Initiator/Handler ///////////////////////////
  /**
   * Fallback Step if initial webRTC connection attempt fails.
   * Retries setting up the WebRTC connection using TURN
   */
  attemptTurnConnect() {
    this.triedTurn = true
    this.socketEmit(this.signals.tryTurn, { connId: this.connId, cont: true })
  }
}

export default MewConnectReceiver
