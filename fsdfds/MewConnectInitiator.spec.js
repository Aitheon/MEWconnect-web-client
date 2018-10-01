// import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Initiator as MewConnect } from '../../dist';
// import wrtc from 'wrtc';
// import MewConnectReceiver from '../helpers/MewConnectReceiver';

import deepProxy from '../helpers/common'

import MewConnectCommon from '../../src/MewConnectCommon';
// import MewConnectCrypto from '../../src/MewConnectCrypto';
// import MewConnectCrypto from '../../src/MewConnectCrypto';
// const logging = require('logging')
import { isBrowser } from 'browser-or-node';
import detectBrowser from 'detect-browser';
import MewConnectReceiver from '../helpers/MewConnectReceiver';
import MewConnectCrypto from '../helpers/MewConnectCrypto_Mock';

const debugLogger = require('debug');
const io = require('socket.io-client');
const EventEmitter = require('events').EventEmitter;
// const MewConnectCrypto = require('../../src/index').Crypto;
// const MewConnect = require('../../src/index').Initiator;
// const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');
// const assert = chai.assert;
jest.mock('simple-peer');
// const logging = require('logging')

Object.defineProperties(window, {
  'MediaStream': {
    value: wrtc.MediaStream
  },
  'MediaStreamTrack': {
    value: wrtc.MediaStreamTrack
  },
  'RTCDataChannel': {
    value: wrtc.RTCDataChannel
  },
  'RTCDataChannelEvent': {
    value: wrtc.RTCDataChannelEvent
  },
  'RTCIceCandidate': {
    value: wrtc.RTCIceCandidate
  },
  'RTCPeerConnection': {
    value: wrtc.RTCPeerConnection
  },
  'RTCPeerConnectionIceEvent': {
    value: wrtc.RTCPeerConnectionIceEvent
  },
  'RTCRtpReceiver': {
    value: wrtc.RTCRtpReceiver
  },
  'RTCRtpSender': {
    value: wrtc.RTCRtpSender
  },
  'RTCSessionDescription': {
    value: wrtc.RTCSessionDescription
  }
});

describe('usingRedis.test.js', function() {

  it('should connect', (done) => {
    console.log('should connect'); // todo remove dev item
    const uiCommMock = jest.fn
    let mewConnectClient = MewConnect.init({cryptoImpl: MewConnectCrypto.create()});
    // let mewConnectClient = deepProxy(MewConnect.init({cryptoImpl: MewConnectCrypto.create()}), uiCommMock);

    mewConnectClient.initiatorStart('http://172.20.0.24');

    // let uiComm = jest.fn(mewConnectClient.uiCommunicator);

    mewConnectClient.on('codeDisplay', code => {
      console.log(code); // todo remove dev item
      const connParts = code.split('_');
      let params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };

      let recieverPeer = new MewConnectReceiver({cryptoImpl: MewConnectCrypto.create()});
      setTimeout(() => {
        recieverPeer.receiverStart('http://172.20.0.24', params);
      }, 500);

      recieverPeer.on('signatureCheck', () => {
        console.log('signatureCheck'); // todo remove dev item
      });
      mewConnectClient.on('RtcInitiatedEvent', () => {
        console.log('RtcInitiatedEvent'); // todo remove dev item
      });

      mewConnectClient.on('OfferCreated', () => {
        console.log('OfferCreated'); // todo remove dev item
      });

      mewConnectClient.on('RtcConnectedEvent', () => {
        console.log(uiComm); // todo remove dev item
        console.log('RtcConnectedEvent'); // todo remove dev item
        mewConnectClient.disconnectRTC();
        recieverPeer.disconnectRTC();
        mewConnectClient.socketDisconnect();
        recieverPeer.socketDisconnect();
        expect(uiCommMock).toHaveBeenCalledTimes(1)
        done();
      });

    });
  });

  it.skip('should call fallback', (done) => {
    console.log('should call fallback'); // todo remove dev item
    let mewConnectClient = MewConnect.init({cryptoImpl: MewConnectCrypto.create()});

    mewConnectClient.initiatorStart('http://172.20.0.24');

    let uiComm = jest.fn(mewConnectClient.uiCommunicator);

    mewConnectClient.on('codeDisplay', code => {
      const connParts = code.split('_');
      let params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };

      let recieverPeer = new MewConnectReceiver({cryptoImpl: MewConnectCrypto.create()});
      setTimeout(() => {
        recieverPeer.receiverStart('http://172.20.0.24', params);
      }, 500);

      recieverPeer.on('signatureCheck', () => {
        console.log('signatureCheck'); // todo remove dev item
        recieverPeer.useFallback();
      });
      mewConnectClient.on('RtcInitiatedEvent', () => {
        console.log('RtcInitiatedEvent'); // todo remove dev item
      });

      mewConnectClient.on('OfferCreated', () => {
        console.log('OfferCreated'); // todo remove dev item
      });

      mewConnectClient.on('RtcConnectedEvent', () => {
        console.log(uiComm); // todo remove dev item
        console.log('RtcConnectedEvent'); // todo remove dev item
        mewConnectClient.disconnectRTC();
        recieverPeer.disconnectRTC();
        expect(true).toBeTruthy();
      });

    });
  });

  /*
  constructor
init
destroyOnUnload
checkBrowser
checkWebRTCAvailable
getSocketConnectionState
getConnectonState
uiCommunicator
emitStatus
displayCode
regenerateCode
useFallback
initiatorStart
socketEmit
socketDisconnect
socketOn
initiatorConnect
socketDisconnectHandler
willAttemptTurn
attemptingTurn
busyFailure
invalidFailure
confirmationFailure
sendOffer
recieveAnswer
rtcRecieveAnswer
initiatorStartRTC
initiatorSignalListener
onConnect
onData
onClose
onError
sendRtcMessageClosure
sendRtcMessage
disconnectRTCClosure
disconnectRTC
rtcSend
rtcDestroy
retryViaTurn
  */

  // it('sanity check', (done) => {
  //   console.log(MewConnect.getBrowserRTC());
  //   const defaultOptions = {
  //     initiator: true,
  //     trickle: true,
  //     iceTransportPolicy: 'all'
  //     // config: {
  //     //   iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
  //     // }
  //   };
  //   var peer1 = new SimplePeer(defaultOptions);
  //   var peer2 = new SimplePeer();
  //
  //   peer1.on('signal', function(data) {
  //     expect(data).toBeTruthy();
  //     // console.log(`peer1.on('signal'`, data);
  //     peer2.signal(data);
  //   });
  //
  //   peer2.on('signal', function(data) {
  //     // console.log(`peer2.on('signal'`, data);
  //     expect(data).toBeTruthy();
  //     peer1.signal(data);
  //   });
  //
  //   peer1.on('connect', function() {
  //     console.log(`peer1.on('connect'`);
  //     peer1.send('hello world');
  //   });
  //
  //   peer2.on('data', function(data) {
  //     console.log(`peer2.on('data'`, data);
  //     expect(data).toBeTruthy();
  //     // console.log('got a message from peer1: ' + data);
  //     done();
  //   });
  // });

});
