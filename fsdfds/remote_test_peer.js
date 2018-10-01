import '@babel/polyfill'
// import * as MewConnectSrc from '../../src';
import MewConnectReceiver from './helpers/MewConnectReceiver';
import MewConnectCryptoMock from './helpers/MewConnectCrypto_Mock';
import { expect } from 'chai';

describe('Check Base Connection Operation', function () {
  const MewConnect = MewConnectSrc.default.Initiator;
  it('should connect', function (done) {
    let stageCount = 0;
    var mewConnectClient = MewConnect.init();
    mewConnectClient.initiatorStart('https://connect.mewapi.io');
    mewConnectClient.on('codeDisplay', function (code) {
      var connParts = code.split('_');
      var params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };
      let recieverPeer = new MewConnectReceiver();
      setTimeout(function () {
        recieverPeer.receiverStart('https://connect.mewapi.io', params);
      }, 500);
      recieverPeer.on('signatureCheck', function () {
        stageCount++;
        console.log('signatureCheck'); // todo remove dev item
      });
      mewConnectClient.on('RtcInitiatedEvent', function () {
        stageCount++;
        console.log('RtcInitiatedEvent'); // todo remove dev item
      });
      mewConnectClient.on('OfferCreated', function () {
        stageCount++;
        console.log('OfferCreated'); // todo remove dev item
      });
      mewConnectClient.on('RtcConnectedEvent', function () {
        stageCount++;
        console.log('RtcConnectedEvent'); // todo remove dev item

        mewConnectClient.disconnectRTC();
        recieverPeer.disconnectRTC();
        mewConnectClient.socketDisconnect();
        recieverPeer.socketDisconnect();
        expect(stageCount).to.equal(4);
        done();
      });
    });
  });
  it('should call fallback', function (done) {
    this.timeout(5000);
    var usedTurn = false;
    console.log('should call fallback'); // todo remove dev item

    var mewConnectClient = MewConnect.init();
    mewConnectClient.initiatorStart('http://172.20.0.24');
    mewConnectClient.on('codeDisplay', function (code) {
      var connParts = code.split('_');
      var params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };
      let recieverPeer = new MewConnectReceiver();
      setTimeout(function () {
        recieverPeer.receiverStart('http://172.20.0.24', params);
      }, 500);
      recieverPeer.on('signatureCheck', function () {
        console.log('recieverPeer: signatureCheck'); // todo remove dev item
      });
      recieverPeer.on('RtcSignalEvent', function () {
        console.log('recieverPeer: RtcSignalEvent'); // todo remove dev item
      });
      mewConnectClient.on('RtcInitiatedEvent', function () {
        console.log('RtcInitiatedEvent'); // todo remove dev item
      });
      recieverPeer.once('RtcInitiatedEvent', function () {
        console.log('recieverPeer: RtcInitiatedEvent'); // todo remove dev item

        mewConnectClient.useFallback();
      });
      mewConnectClient.on('OfferCreated', function () {
        console.log('OfferCreated'); // todo remove dev item
      });
      mewConnectClient.on('UsingFallback', function () {
        console.log('UsingFallback'); // todo remove dev item

        usedTurn = true;
      });
      recieverPeer.on('UsingFallback', function () {
        console.log('recieverPeer: UsingFallback'); // todo remove dev item
      });
      mewConnectClient.on('RtcConnectedEvent', function () {
        console.log('RtcConnectedEvent'); // todo remove dev item

        mewConnectClient.disconnectRTC();
        recieverPeer.disconnectRTC();
        mewConnectClient.socketDisconnect();
        recieverPeer.socketDisconnect();
        expect(usedTurn).to.be.true;
        done();
      });
    });
  });
});

// describe('Check Base Connection Operation', function() {
//   const MewConnect = MewConnectSrc.default.Initiator;
//
//   it('should connect', function(done) {
//     let mewConnectClient = MewConnect.init();
//     mewConnectClient.initiatorStart('https://connect.mewapi.io');
//     mewConnectClient.on('codeDisplay', code => {
//       const connParts = code.split('_');
//       let params = {
//         connId: connParts[2].trim(),
//         key: connParts[1].trim(),
//         version: connParts[0].trim()
//       };
//
//       let recieverPeer = new MewConnectReceiver();
//
//       setTimeout(() => {
//         recieverPeer.receiverStart('https://connect.mewapi.io', params);
//       }, 500);
//
//       recieverPeer.on('signatureCheck', () => {
//         console.log('signatureCheck'); // todo remove dev item
//
//       });
//       mewConnectClient.on('RtcInitiatedEvent', () => {
//         console.log('RtcInitiatedEvent'); // todo remove dev item
//       });
//
//       mewConnectClient.on('OfferCreated', () => {
//         console.log('OfferCreated'); // todo remove dev item
//       });
//
//       mewConnectClient.on('RtcConnectedEvent', () => {
//         console.log('RtcConnectedEvent'); // todo remove dev item
//         mewConnectClient.disconnectRTC();
//         recieverPeer.disconnectRTC();
//         mewConnectClient.socketDisconnect();
//         recieverPeer.socketDisconnect();
//         // expect(uiCommMock).toHaveBeenCalledTimes(1);
//         done();
//       });
//
//     });
//   });
//
//   it('should call fallback', function (done) {
//     this.timeout(5000);
//     let usedTurn = false;
//     console.log('should call fallback'); // todo remove dev item
//     let mewConnectClient = MewConnect.init();
//
//     mewConnectClient.initiatorStart('http://172.20.0.24');
//
//     mewConnectClient.on('codeDisplay', code => {
//       const connParts = code.split('_');
//       let params = {
//         connId: connParts[2].trim(),
//         key: connParts[1].trim(),
//         version: connParts[0].trim()
//       };
//
//       let recieverPeer = new MewConnectReceiver();
//
//       setTimeout(() => {
//         recieverPeer.receiverStart('http://172.20.0.24', params);
//       }, 500);
//
//       recieverPeer.on('signatureCheck', () => {
//         console.log('recieverPeer: signatureCheck'); // todo remove dev item
//       });
//
//       recieverPeer.on('RtcSignalEvent', () => {
//         console.log('recieverPeer: RtcSignalEvent'); // todo remove dev item
//       });
//
//       mewConnectClient.on('RtcInitiatedEvent', () => {
//         console.log('RtcInitiatedEvent'); // todo remove dev item
//       });
//
//       recieverPeer.once('RtcInitiatedEvent', () => {
//         console.log('recieverPeer: RtcInitiatedEvent'); // todo remove dev item
//         mewConnectClient.useFallback();
//       });
//
//       mewConnectClient.on('OfferCreated', () => {
//         console.log('OfferCreated'); // todo remove dev item
//       });
//
//       mewConnectClient.on('UsingFallback', () => {
//         console.log('UsingFallback'); // todo remove dev item
//         usedTurn = true;
//       });
//
//       recieverPeer.on('UsingFallback', () => {
//         console.log('recieverPeer: UsingFallback'); // todo remove dev item
//       });
//
//       mewConnectClient.on('RtcConnectedEvent', () => {
//         console.log('RtcConnectedEvent'); // todo remove dev item
//         mewConnectClient.disconnectRTC();
//         recieverPeer.disconnectRTC();
//         mewConnectClient.socketDisconnect();
//         recieverPeer.socketDisconnect();
//         expect(usedTurn).to.be.true;
//         done();
//       });
//
//     });
//   });
//
//
//
// });
