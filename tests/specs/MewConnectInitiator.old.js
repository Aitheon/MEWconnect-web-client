import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import MewConnect from '../../dist';
import wrtc from 'wrtc';

import MewConnectCommon from '../../src/MewConnectCommon';
import MewConnectCrypto from '../../src/MewConnectCrypto';
// import MewConnectCrypto from '../../src/MewConnectCrypto';

// const assert = chai.assert;

describe('usingRedis.test.js', function() {


  // test cases
  it('Add single entry', function(done) {
    class MewConnectReceiver extends MewConnectCommon {
      constructor(
        additionalLibs = {}
      ) {
        super();
        this.p = null;
        this.qrCodeString = null;
        this.socketConnected = false;
        this.connected = false;
        this.signalUrl = null;
        this.turnServers = [];

        this.io = io;
        this.Peer = SimplePeer;
        this.mewCrypto = MewConnectCrypto.create();

        this.signals = this.jsonDetails.signals;
        this.rtcEvents = this.jsonDetails.rtc;
        this.version = this.jsonDetails.version;
        this.versions = this.jsonDetails.versions;
        this.lifeCycle = this.jsonDetails.lifeCycle;
        this.stunServers = this.jsonDetails.stunSrvers;
      }

      parseConnectionCodeString(str) {
        try {
          const connParts = str.split(this.jsonDetails.connectionCodeSeparator);
          return {
            connId: connParts[2].trim(),
            key: connParts[1].trim(),
            version: connParts[0].trim()
          };
        } catch (e) {
          logger.error(e);
        }
      }

      socketEmit(signal, data) {
        this.socket.binary(false).emit(signal, data);
      }

      // socket.disconnect wrapper
      socketDisconnect() {
        this.socket.disconnect();
      }

      // socket.on wrapper
      socketOn(signal, func) {
        if (typeof func !== 'function') logger.error('not a function?', signal); // one of the handlers is/was not initializing properly
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
          this.socketOn(this.signals.handshake, this.socketHandshake.bind(this));
          this.socketOn(this.signals.offer, this.processOfferReceipt.bind(this));
          this.socketOn(this.signals.confirmationFailedBusy, this.busyFailure.bind(this));
          this.socketOn(this.signals.confirmationFailed, this.confirmationFailure.bind(this));
          this.socketOn(this.signals.invalidConnection, this.invalidFailure.bind(this));
          this.socketOn(this.signals.disconnect, this.socketDisconnectHandler.bind(this));
          this.socketOn(this.signals.attemptingTurn, this.willAttemptTurn.bind(this));
          this.socketOn(this.signals.turnToken, this.retryViaTurn.bind(this));
        } catch (e) {
          done(e);
        }
      }

      async socketHandshake() {
        console.log('1');
        this.signed = await this.mewCrypto.signMessage(
          this.mewCrypto.prvt.toString('hex')
        );
        const encryptedVersion = await this.mewCrypto.encrypt(this.version);
        setTimeout(() => {
          this.socketEmit(this.signals.signature, {
            signed: this.signed,
            connId: this.connId,
            version: encryptedVersion
          });
        }, 100);
      }

      socketDisconnectHandler(reason) { this.socketConnected = false; }

      willAttemptTurn() { }

      attemptingTurn(data) {this.retryViaTurn(data);}

      busyFailure() {}

      invalidFailure() {}

      confirmationFailure() {}

      async processOfferReceipt(data) {
        console.log('1');
        const decryptedOffer = await this.mewCrypto.decrypt(data.data);
        const decryptedData = {
          data: decryptedOffer
        };
        this.receiveOffer(decryptedData);
      }

      async onSignal(data) {
        console.log('1');
        const encryptedSend = await this.mewCrypto.encrypt(JSON.stringify(data));
        this.socketEmit(this.signals.answerSignal, {
          data: encryptedSend,
          connId: this.connId
        });
      }

      receiveOffer(data) {
        console.log(data); // todo remove dev item
        console.log('1');
        const webRtcConfig = data.options || {};
        const webRtcServers = webRtcConfig.servers || [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }];

        const simpleOptions = {
          initiator: false,
          trickle: false,
          reconnectTimer: 100,
          iceTransportPolicy: 'relay',
          config: {
            iceServers: webRtcServers
          },
          wrtc: wrtc
        };

        this.p = new this.Peer(simpleOptions);
        this.p.signal(JSON.parse(data.data));
        this.p.on(this.rtcEvents.error, this.onError.bind(this));
        this.p.on(this.rtcEvents.connect, this.onConnect.bind(this));
        this.p.on(this.rtcEvents.close, this.onClose.bind(this));
        this.p.on(this.rtcEvents.data, this.onData.bind(this));
        this.p.on('signal', this.onSignal.bind(this));
      }

      onConnect() {
        console.log('1');
        this.socketEmit(this.signals.rtcConnected, this.connId);
        this.tryTurn = false;
        this.socketDisconnect();
      }

      async onData(data) {
        console.log('1');
        let decryptedData;
        if (this.isJSON(data)) {
          decryptedData = await this.mewCrypto.decrypt(JSON.parse(data.toString()));
        } else {
          decryptedData = await this.mewCrypto.decrypt(JSON.parse(data.toString()));
        }
        if (this.isJSON(decryptedData)) {
          this.applyDatahandlers(JSON.parse(decryptedData));
        } else {
          this.applyDatahandlers(decryptedData);
        }
      }

      onClose() {if (!this.triedTurn && this.tryTurn) {this.attemptTurnConnect();}}

      onError(err) {}

      sendRtcMessage(type, msg) {
        return () => {this.rtcSend(JSON.stringify({ type: type, data: msg }));};
      }

      sendRtcMessageResponse(type, msg) {
        this.rtcSend(JSON.stringify({ type: type, data: msg }));
      }

      disconnectRTC() {
        return () => {
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

      attemptTurnConnect() {
        this.triedTurn = true;
        this.socketEmit(this.signals.tryTurn, { connId: this.connId, cont: true });
      }

      retryViaTurn(data) {
        const options = {
          signalListener: this.initiatorSignalListener,
          webRtcConfig: {
            servers: data.data
          }
        };
        this.initiatorStartRTC(this.socket, options);
      }

      retryViaTurn(data) {
        console.log('reciever TURN TOKEN RECIEVED');
        this.receiveOffer(data);
      }
    };

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    let socketManager, socket, signed, params, socketHandshake;

    console.log(MewConnectReceiver); // todo remove dev item
    let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });

    mewConnectClient.initiatorStart('http://172.20.0.24');

    mewConnectClient.on('codeDisplay', async code => {

      let recieverPeer = new MewConnectReceiver();
      const connParts = code.split('_');
      params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };
      expect(code).toBeTruthy();
      recieverPeer.receiverStart('http://172.20.0.24', params);
    });

    // mewConnectClient.on('rtcConnected', () => {
    //   console.log('congrats you are connected to mew connect!');
    // });

  });
//--------------------------------------------------------------------------------------------------
//   it('uses fallback', function(done) {
//     let socketManager, socket, signed, params, socketHandshake;
//
//     let setupListeners = function(_socket) {
//
//       _socket.on('handshake', async code => {
//         console.log('handshake', code); // todo remove dev item
//         signed = await mewCrypto.signMessage(
//           mewCrypto.prvt.toString('hex')
//         );
//
//         socket.emit('tryTurn', { connId: params.connId });
//         done();
//       });
//
//       // _socket.on('handshake', async code => {
//       //   console.log('handshake', code); // todo remove dev item
//       //   signed = await mewCrypto.signMessage(
//       //     mewCrypto.prvt.toString('hex')
//       //   );
//       //
//       //   const encryptedVersion = await mewCrypto.encrypt(params.version);
//       //   socket.emit('signature', {
//       //     signed: signed,
//       //     connId: params.connId,
//       //     version: encryptedVersion
//       //   });
//       //   done();
//       // })
//     };
//
//     let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });
//     let mewCrypto = MewConnect.Crypto.create();
//
//     mewConnectClient.initiatorStart('http://127.0.0.1:8081');
//
//     mewConnectClient.on('codeDisplay', async code => {
//       const connParts = code.split('_');
//       params = {
//         connId: connParts[2].trim(),
//         key: connParts[1].trim(),
//         version: connParts[0].trim()
//       };
//       expect(code).toBeTruthy();
//
//       mewCrypto.setPrivate(params.key);
//       signed = await mewCrypto.signMessage(params.key);
//
//       const options = {
//         query: {
//           signed,
//           connId: params.connId,
//           stage: 'receiver'
//         },
//         secure: true
//       };
//
//       socketManager = io('http://127.0.0.1:8081', options);
//       socket = socketManager.connect();
//       setupListeners(socket);
//     });
//
//     mewConnectClient.on('rtcConnected', () => {
//       console.log('congrats you are connected to mew connect!');
//     });
//
//   });

});
