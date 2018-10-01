import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import MewConnect from '../../dist';
import wrtc from 'wrtc';
import MewConnectReceiver from '../helpers/MewConnectReceiver';

import MewConnectCommon from '../../src/MewConnectCommon';
import MewConnectCrypto from '../../src/MewConnectCrypto';
// import MewConnectCrypto from '../../src/MewConnectCrypto';

// const assert = chai.assert;

describe('usingRedis.test.js', function() {


  // test cases
  it('codeDisplay', function(done) {

    let params;

    let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });

    setTimeout(()=>{
      mewConnectClient.initiatorStart('http://172.20.0.24');
    }, 200)

    mewConnectClient.on('codeDisplay', code => {
      try {

        setTimeout(() => {
          let recieverPeer = new MewConnectReceiver();
          const connParts = code.split('_');
          params = {
            connId: connParts[2].trim(),
            key: connParts[1].trim(),
            version: connParts[0].trim()
          };
          expect(code).toBeTruthy();
          recieverPeer.receiverStart('http://172.20.0.24', params);
          recieverPeer.on('RtcConnectedEvent', () => {
            mewConnectClient.disconnect();
            recieverPeer.socketDisconnect();
            done();
          });
          setTimeout(() => {
            mewConnectClient.socketDisconnect();
            recieverPeer.socketDisconnect();
            done('fail');
          }, 4000);
        }, 400);
      } catch (e) {
        console.error(e);
      }

    });

    let initiateSocketButtonState = jest.fn();
    let initiateRtcButtonState = jest.fn();
    let rtcConnectButtonState = jest.fn();
    let rtcCloseButtonState = jest.fn();
    let disconnectRtcButtonState = jest.fn();

    mewConnectClient.on('SocketConnectedEvent', initiateSocketButtonState);
    mewConnectClient.on('RtcInitiatedEvent', initiateRtcButtonState);
    mewConnectClient.on('RtcConnectedEvent', rtcConnectButtonState);
    mewConnectClient.on('RtcDisconnectEvent', disconnectRtcButtonState);
    mewConnectClient.on('RtcClosedEvent', rtcCloseButtonState);

    expect(initiateSocketButtonState.mock.calls.length).toBe(1);
    expect(initiateRtcButtonState.mock.calls.length).toBe(1);
    expect(rtcConnectButtonState.mock.calls.length).toBe(1);
    expect(rtcCloseButtonState.mock.calls.length).toBe(1);
    expect(disconnectRtcButtonState.mock.calls.length).toBe(1);
  });

  // it('codeDisplay', function(done) {
  //
  //   let socketManager, socket, signed, params, socketHandshake;
  //
  //   let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });
  //
  //   mewConnectClient.initiatorStart('http://172.20.0.24');
  //
  //   mewConnectClient.on('codeDisplay', async code => {
  //
  //     let recieverPeer = new MewConnectReceiver();
  //     const connParts = code.split('_');
  //     params = {
  //       connId: connParts[2].trim(),
  //       key: connParts[1].trim(),
  //       version: connParts[0].trim()
  //     };
  //     expect(code).toBeTruthy();
  //     recieverPeer.receiverStart('http://172.20.0.24', params);
  //   });
  // });
  //
  // it('Add single entry', function(done) {
  //
  //   let socketManager, socket, signed, params, socketHandshake;
  //
  //   console.log(MewConnectReceiver); // todo remove dev item
  //   let mewConnectClient = MewConnect.Initiator.init({ rtcOptions: { wrtc: wrtc } });
  //
  //   mewConnectClient.initiatorStart('http://172.20.0.24');
  //
  //   mewConnectClient.on('codeDisplay', async code => {
  //
  //     let recieverPeer = new MewConnectReceiver();
  //     const connParts = code.split('_');
  //     params = {
  //       connId: connParts[2].trim(),
  //       key: connParts[1].trim(),
  //       version: connParts[0].trim()
  //     };
  //     expect(code).toBeTruthy();
  //     recieverPeer.receiverStart('http://172.20.0.24', params);
  //   });
  // });
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
