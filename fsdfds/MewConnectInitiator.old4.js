// import io from 'socket.io-client';
// import SimplePeer from 'simple-peer';
// import MewConnect from '../../dist';
// import wrtc from 'wrtc';
// import MewConnectReceiver from '../helpers/MewConnectReceiver';
//
import MewConnectCommon from '../../src/MewConnectCommon';
// import MewConnectCrypto from '../../src/MewConnectCrypto';
// import MewConnectCrypto from '../../src/MewConnectCrypto';
// const logging = require('logging')
import { isBrowser } from 'browser-or-node';
import detectBrowser from 'detect-browser'
import MewConnectReceiver from '../helpers/MewConnectReceiver';
const debugLogger = require('debug');
const io = require('socket.io-client');
const EventEmitter = require('events').EventEmitter;
const MewConnectCrypto = require('../../dist/index').Crypto;
const MewConnect = require('../../dist/index').Initiator;
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');
// const assert = chai.assert;

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
  },
});

describe('usingRedis.test.js', function() {

  it('should trigger turn', ()=>{
    let mewConnectClient = MewConnect.init();
    mewConnectClient.initiatorStart('http://172.20.0.24');
    const defaultOptions = {
      initiator: true,
      // trickle: true,
      // iceTransportPolicy: 'all',
      config: {
        iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
      }
    };
    mewConnectClient.initiatorStartRTC(mewConnectClient.socket, defaultOptions)
  })

//   it.skip('should have window', (done)=>{
//     console.log(MewConnect.getBrowserRTC())
//     const defaultOptions = {
//       initiator: true,
//       trickle: true,
//       iceTransportPolicy: 'all',
//       // config: {
//       //   iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
//       // }
//     };
//     var peer1 = new SimplePeer(defaultOptions)
//     var peer2 = new SimplePeer()
//
//     peer1.on('signal', function (data) {
//       console.log(`peer1.on('signal'`, data);
//       peer2.signal(data)
//     })
//
//     peer2.on('signal', function (data) {
//       console.log(`peer2.on('signal'`, data);
//       peer1.signal(data)
//     })
//
//     peer1.on('connect', function () {
//       console.log(`peer1.on('connect'`);
//       peer1.send('hello world')
//     })
//
//     peer2.on('data', function (data) {
//       console.log(`peer2.on('data'`, data);
//       console.log('got a message from peer1: ' + data)
//       done()
//     })
//   })
//
//   it.skip('should create a peer', () =>{
//     const suppliedOptions = {};
//     const defaultOptions = {
//       initiator: true,
//       trickle: true,
//       iceTransportPolicy: 'all',
//       config: {
//         iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
//       }
//     };
//
//     const simpleOptions = {
//       ...defaultOptions,
//       ...suppliedOptions
//     };
//     let p = new SimplePeer(simpleOptions)
//   })
//
//
//
//   // it('something else', () => {
//   //   let recieverPeer = new MewConnectReceiver();
//   //   recieverPeer.receiveOffer()
//   // })
//
//   it.skip('should start', (done) =>{
//       let mewConnectClient = MewConnect.init();
//
//       setTimeout(()=>{
//         mewConnectClient.initiatorStart('http://172.20.0.24');
//         const defaultOptions = {
//           initiator: true,
//           // trickle: true,
//           // iceTransportPolicy: 'all',
//           config: {
//             iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
//           }
//         };
//         mewConnectClient.initiatorStartRTC(mewConnectClient.socket, defaultOptions)
//       }, 200)
//
//       mewConnectClient.on('codeDisplay', code => {
//         const connParts = code.split('_');
//        let params = {
//           connId: connParts[2].trim(),
//           key: connParts[1].trim(),
//           version: connParts[0].trim()
//         };
//        console.log(window._document); // todo remove dev item
//         let recieverPeer = new MewConnectReceiver();
//         setTimeout(() =>{
//           recieverPeer.receiverStart('http://172.20.0.24', params);
//         }, 500)
//
//         recieverPeer.on('signatureCheck', () =>{
//           console.log('signatureCheck'); // todo remove dev item
//         })
//         const defaultOptions = {
//           initiator: true,
//           // trickle: true,
//           // iceTransportPolicy: 'all',
//           config: {
//             iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
//           }
//         };
//         mewConnectClient.initiatorStartRTC(mewConnectClient.socket, defaultOptions)
//         // mewConnectClient.on('receiverVersion', () =>{
//         //   console.log('receiverVersion'); // todo remove dev item
//         // })
//         //
//         // mewConnectClient.on('RtcInitiatedEvent', () =>{
//         //   console.log('pre-done'); // todo remove dev item
//         //   done()
//         // })
//
//       });
//   })
//
//   // test cases
//   // it('codeDisplay', function(done) {
//   //
//   //   let params;
//   //
//   //   let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });
//   //
//   //   setTimeout(()=>{
//   //     mewConnectClient.initiatorStart('http://172.20.0.24');
//   //   }, 200)
//   //
//   //   mewConnectClient.on('codeDisplay', code => {
//   //     const connParts = code.split('_');
//   //     params = {
//   //       connId: connParts[2].trim(),
//   //       key: connParts[1].trim(),
//   //       version: connParts[0].trim()
//   //     };
//   //   });
//   //
//   //   let initiateSocketButtonState = jest.fn();
//   //   let initiateRtcButtonState = jest.fn();
//   //   let rtcConnectButtonState = jest.fn();
//   //   let rtcCloseButtonState = jest.fn();
//   //   let disconnectRtcButtonState = jest.fn();
//   //
//   //   mewConnectClient.on('SocketConnectedEvent', initiateSocketButtonState);
//   //   mewConnectClient.on('RtcInitiatedEvent', initiateRtcButtonState);
//   //   mewConnectClient.on('RtcConnectedEvent', rtcConnectButtonState);
//   //   mewConnectClient.on('RtcDisconnectEvent', disconnectRtcButtonState);
//   //   mewConnectClient.on('RtcClosedEvent', rtcCloseButtonState);
//   //
//   //   expect(initiateSocketButtonState.mock.calls.length).toBe(1);
//   //   expect(initiateRtcButtonState.mock.calls.length).toBe(1);
//   //   expect(rtcConnectButtonState.mock.calls.length).toBe(1);
//   //   expect(rtcCloseButtonState.mock.calls.length).toBe(1);
//   //   expect(disconnectRtcButtonState.mock.calls.length).toBe(1);
//   // });
//
//   // it('codeDisplay', function(done) {
//   //
//   //   let socketManager, socket, signed, params, socketHandshake;
//   //
//   //   let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });
//   //
//   //   mewConnectClient.initiatorStart('http://172.20.0.24');
//   //
//   //   mewConnectClient.on('codeDisplay', async code => {
//   //
//   //     let recieverPeer = new MewConnectReceiver();
//   //     const connParts = code.split('_');
//   //     params = {
//   //       connId: connParts[2].trim(),
//   //       key: connParts[1].trim(),
//   //       version: connParts[0].trim()
//   //     };
//   //     expect(code).toBeTruthy();
//   //     recieverPeer.receiverStart('http://172.20.0.24', params);
//   //   });
//   // });
//   //
//   // it('Add single entry', function(done) {
//   //
//   //   let socketManager, socket, signed, params, socketHandshake;
//   //
//   //   console.log(MewConnectReceiver); // todo remove dev item
//   //   let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });
//   //
//   //   mewConnectClient.initiatorStart('http://172.20.0.24');
//   //
//   //   mewConnectClient.on('codeDisplay', async code => {
//   //
//   //     let recieverPeer = new MewConnectReceiver();
//   //     const connParts = code.split('_');
//   //     params = {
//   //       connId: connParts[2].trim(),
//   //       key: connParts[1].trim(),
//   //       version: connParts[0].trim()
//   //     };
//   //     expect(code).toBeTruthy();
//   //     recieverPeer.receiverStart('http://172.20.0.24', params);
//   //   });
//   // });
// //--------------------------------------------------------------------------------------------------
// //   it('uses fallback', function(done) {
// //     let socketManager, socket, signed, params, socketHandshake;
// //
// //     let setupListeners = function(_socket) {
// //
// //       _socket.on('handshake', async code => {
// //         console.log('handshake', code); // todo remove dev item
// //         signed = await mewCrypto.signMessage(
// //           mewCrypto.prvt.toString('hex')
// //         );
// //
// //         socket.emit('tryTurn', { connId: params.connId });
// //         done();
// //       });
// //
// //       // _socket.on('handshake', async code => {
// //       //   console.log('handshake', code); // todo remove dev item
// //       //   signed = await mewCrypto.signMessage(
// //       //     mewCrypto.prvt.toString('hex')
// //       //   );
// //       //
// //       //   const encryptedVersion = await mewCrypto.encrypt(params.version);
// //       //   socket.emit('signature', {
// //       //     signed: signed,
// //       //     connId: params.connId,
// //       //     version: encryptedVersion
// //       //   });
// //       //   done();
// //       // })
// //     };
// //
// //     let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });
// //     let mewCrypto = MewConnect.Crypto.create();
// //
// //     mewConnectClient.initiatorStart('http://127.0.0.1:8081');
// //
// //     mewConnectClient.on('codeDisplay', async code => {
// //       const connParts = code.split('_');
// //       params = {
// //         connId: connParts[2].trim(),
// //         key: connParts[1].trim(),
// //         version: connParts[0].trim()
// //       };
// //       expect(code).toBeTruthy();
// //
// //       mewCrypto.setPrivate(params.key);
// //       signed = await mewCrypto.signMessage(params.key);
// //
// //       const options = {
// //         query: {
// //           signed,
// //           connId: params.connId,
// //           stage: 'receiver'
// //         },
// //         secure: true
// //       };
// //
// //       socketManager = io('http://127.0.0.1:8081', options);
// //       socket = socketManager.connect();
// //       setupListeners(socket);
// //     });
// //
// //     mewConnectClient.on('rtcConnected', () => {
// //       console.log('congrats you are connected to mew connect!');
// //     });
// //
// //   });

});
