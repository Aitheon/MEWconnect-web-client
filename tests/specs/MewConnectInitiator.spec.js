import '@babel/polyfill'
import * as MewConnectSrc from '../../src';
import MewConnectReceiver from '../helpers/MewConnectReceiver';
import { expect } from 'chai';

describe('Check Base Connection Operation', function() {
  const MewConnect = MewConnectSrc.default.Initiator;

  it('should connect', function(done) {
    let mewConnectClient = MewConnect.init();
    mewConnectClient.initiatorStart('http://172.20.0.24');
    mewConnectClient.on('codeDisplay', code => {
      const connParts = code.split('_');
      let params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };

      let recieverPeer = new MewConnectReceiver();

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
        console.log('RtcConnectedEvent'); // todo remove dev item
        mewConnectClient.disconnectRTC();
        recieverPeer.disconnectRTC();
        mewConnectClient.socketDisconnect();
        recieverPeer.socketDisconnect();
        // expect(uiCommMock).toHaveBeenCalledTimes(1);
        done();
      });

    });
  });

  it('should call fallback', function (done) {
    this.timeout(5000);
    let usedTurn = false;
    console.log('should call fallback'); // todo remove dev item
    let mewConnectClient = MewConnect.init();

    mewConnectClient.initiatorStart('http://172.20.0.24');

    mewConnectClient.on('codeDisplay', code => {
      const connParts = code.split('_');
      let params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };

      let recieverPeer = new MewConnectReceiver();

      setTimeout(() => {
        recieverPeer.receiverStart('http://172.20.0.24', params);
      }, 500);

      recieverPeer.on('signatureCheck', () => {
        console.log('recieverPeer: signatureCheck'); // todo remove dev item
      });

      recieverPeer.on('RtcSignalEvent', () => {
        console.log('recieverPeer: RtcSignalEvent'); // todo remove dev item
      });

      mewConnectClient.on('RtcInitiatedEvent', () => {
        console.log('RtcInitiatedEvent'); // todo remove dev item
      });

      recieverPeer.once('RtcInitiatedEvent', () => {
        console.log('recieverPeer: RtcInitiatedEvent'); // todo remove dev item
        mewConnectClient.useFallback();
      });

      mewConnectClient.on('OfferCreated', () => {
        console.log('OfferCreated'); // todo remove dev item
      });

      mewConnectClient.on('UsingFallback', () => {
        console.log('UsingFallback'); // todo remove dev item
        usedTurn = true;
      });

      recieverPeer.on('UsingFallback', () => {
        console.log('recieverPeer: UsingFallback'); // todo remove dev item
      });

      mewConnectClient.on('RtcConnectedEvent', () => {
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


  // it('should call fallback', function (done) {
  //   this.timeout(5000);
  //   let usedTurn = false;
  //   console.log('should call fallback'); // todo remove dev item
  //
  //   let recieverPeer = new MewConnectReceiver();
  //   recieverPeer.receiverStart('http://172.20.0.24', params);
  //
  //   let mewConnectClient = MewConnect.init();
  //   setTimeout(() => {
  //     mewConnectClient.initiatorStart('http://172.20.0.24');
  //   }, 500);
  //
  //   mewConnectClient.on('codeDisplay', code => {
  //     const connParts = code.split('_');
  //     let params = {
  //       connId: connParts[2].trim(),
  //       key: connParts[1].trim(),
  //       version: connParts[0].trim()
  //     };
  //
  //     recieverPeer.on('signatureCheck', () => {
  //       console.log('recieverPeer: signatureCheck'); // todo remove dev item
  //     });
  //
  //     recieverPeer.on('RtcSignalEvent', () => {
  //       console.log('recieverPeer: RtcSignalEvent'); // todo remove dev item
  //     });
  //
  //     mewConnectClient.on('RtcInitiatedEvent', () => {
  //       console.log('RtcInitiatedEvent'); // todo remove dev item
  //     });
  //
  //     recieverPeer.on('RtcInitiatedEvent', () => {
  //       console.log('recieverPeer: RtcInitiatedEvent'); // todo remove dev item
  //       mewConnectClient.useFallback();
  //     });
  //
  //     mewConnectClient.on('OfferCreated', () => {
  //       console.log('OfferCreated'); // todo remove dev item
  //     });
  //
  //     mewConnectClient.on('UsingFallback', () => {
  //       console.log('UsingFallback'); // todo remove dev item
  //       usedTurn = true;
  //     });
  //
  //     recieverPeer.on('UsingFallback', () => {
  //       console.log('recieverPeer: UsingFallback'); // todo remove dev item
  //     });
  //
  //     mewConnectClient.on('RtcConnectedEvent', () => {
  //       console.log('RtcConnectedEvent'); // todo remove dev item
  //       mewConnectClient.disconnectRTC();
  //       recieverPeer.disconnectRTC();
  //       mewConnectClient.socketDisconnect();
  //       recieverPeer.socketDisconnect();
  //       expect(usedTurn).to.be.true;
  //       done();
  //     });
  //
  //   });
  // });
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


});
