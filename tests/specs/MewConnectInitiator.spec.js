import '@babel/polyfill';
import * as MewConnectSrc from '../../src';
import MewConnectReceiver from '../helpers/MewConnectReceiver';
// import MewConnectCrypto from '../helpers/MewConnectCrypto_Mock'
import { expect as chaiExpect } from 'chai';

const signalUrl = 'http://127.0.0.1:8080';

if (typeof mocha === 'undefined') {
  const wrtc = require('wrtc');

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

}

describe('Check Base Connection Operation', function() {

  // it('should connect', function(done) {
  //   if (typeof mocha !== 'undefined') this.timeout(5000);
  //   let recSignals = [];
  //   let intSignals = [];
  //   let completed = [];
  //   const MewConnect = MewConnectSrc.default.Initiator;
  //   let mewConnectClient = MewConnect.init();
  //
  //   mewConnectClient.initiatorStart(signalUrl);
  //
  //   mewConnectClient.on('codeDisplay', code => {
  //     intSignals.push('codeDisplay');
  //     const connParts = code.split('_');
  //     let params = {
  //       connId: connParts[2].trim(),
  //       key: connParts[1].trim(),
  //       version: connParts[0].trim()
  //     };
  //
  //     let recieverPeer = new MewConnectReceiver();
  //
  //     setTimeout(() => {
  //       recieverPeer.receiverStart(signalUrl, params);
  //     }, 500);
  //
  //     recieverPeer.on('signatureCheck', () => {
  //       recSignals.push('signatureCheck');
  //     });
  //     recieverPeer.on('RtcInitiatedEvent', () => {
  //       recSignals.push('RtcInitiatedEvent');
  //     });
  //
  //     mewConnectClient.on('signatureCheck', () => {
  //       intSignals.push('signatureCheck');
  //     });
  //     mewConnectClient.on('SocketConnectedEvent', () => {
  //       intSignals.push('SocketConnectedEvent');
  //     });
  //     mewConnectClient.on('offerCreated', () => {
  //       intSignals.push('offerCreated');
  //     });
  //     mewConnectClient.on('sendOffer', () => {
  //       intSignals.push('sendOffer');
  //     });
  //     mewConnectClient.on('answerReceived', () => {
  //       intSignals.push('answerReceived');
  //     });
  //     mewConnectClient.on('RtcInitiatedEvent', () => {
  //       intSignals.push('RtcInitiatedEvent');
  //     });
  //     mewConnectClient.on('UsingFallback', () => {
  //       intSignals.push('UsingFallback');
  //     });
  //
  //     mewConnectClient.on('RtcConnectedEvent', () => {
  //       mewConnectClient.disconnectRTC();
  //
  //       chaiExpect(intSignals).to.be.an('array').to.include.members(["signatureCheck","SocketConnectedEvent","offerCreated","sendOffer","answerReceived","codeDisplay","RtcInitiatedEvent"]);
  //       chaiExpect(intSignals).to.not.include(['UsingFallback']);
  //
  //       completed.push('Initiator');
  //       if (completed.includes('Initiator') && completed.includes('Receiver')) {
  //         done();
  //       }
  //     });
  //
  //     recieverPeer.on('RtcConnectedEvent', () => {
  //       recieverPeer.disconnectRTC();
  //       chaiExpect(recSignals).to.be.an('array').to.include.members(["RtcInitiatedEvent","signatureCheck"]);
  //       completed.push('Receiver');
  //
  //       if (completed.includes('Initiator') && completed.includes('Receiver')) {
  //         done();
  //       }
  //     });
  //
  //   });
  // });

  it('should call fallback', function(done) {
    let recSignals = [];
    let intSignals = [];
    let completed = [];
    let fallbackCalled = false;
    const MewConnect = MewConnectSrc.default.Initiator;
    let mewConnectClient = MewConnect.init();

    mewConnectClient.initiatorStart(signalUrl);

    mewConnectClient.on('codeDisplay', code => {
      const connParts = code.split('_');
      let params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };

      let recieverPeer = new MewConnectReceiver();

      setTimeout(() => {
        recieverPeer.receiverStart(signalUrl, params);
      }, 500);

      recieverPeer.on('signatureCheck', () => {
        recSignals.push('signatureCheck');
      });
      recieverPeer.on('RtcInitiatedEvent', () => {
        recSignals.push('RtcInitiatedEvent');
        if(!fallbackCalled){
          fallbackCalled = true;
          mewConnectClient.useFallback();
        }
      });
      recieverPeer.on('UsingFallback', () => {
        try {
          console.log(mewConnectClient.p._pc.signalingState, mewConnectClient.tryingTurn); // todo remove dev item
        } catch (e) { }
        recSignals.push('UsingFallback');
      });


      mewConnectClient.on('RtcClosedEvent', () => {
        console.log('RTC CLOSED--------------------------------------------------'); // todo remove dev item
        intSignals.push('RtcClosedEvent');
      });
      mewConnectClient.on('signatureCheck', () => {
        intSignals.push('signatureCheck');
      });
      mewConnectClient.on('SocketConnectedEvent', () => {
        intSignals.push('SocketConnectedEvent');
      });
      mewConnectClient.on('offerCreated', () => {
        try {
          console.log(mewConnectClient.p._pc.signalingState, mewConnectClient.tryingTurn); // todo remove dev item
        } catch (e) { }
        intSignals.push('offerCreated');
      });
      mewConnectClient.on('sendOffer', () => {
        try {
          console.log(mewConnectClient.p._pc.signalingState, mewConnectClient.tryingTurn); // todo remove dev item
        } catch (e) { }
        intSignals.push('sendOffer');
      });
      mewConnectClient.on('answerReceived', () => {
        try {
          console.log(mewConnectClient.p._pc.signalingState, mewConnectClient.tryingTurn); // todo remove dev item
        } catch (e) { }
        intSignals.push('answerReceived');
      });
      mewConnectClient.on('RtcInitiatedEvent', () => {
        try {
          console.log(mewConnectClient.p._pc.signalingState, mewConnectClient.tryingTurn); // todo remove dev item
        } catch (e) { }
        intSignals.push('RtcInitiatedEvent');
      });
      mewConnectClient.on('UsingFallback', () => {
        try {
          console.log(mewConnectClient.p._pc.signalingState, mewConnectClient.tryingTurn); // todo remove dev item
        } catch (e) { }
        intSignals.push('UsingFallback');
      });
      mewConnectClient.on('gotTurnDetails', () => {
        console.log('gotTurnDetails'); // todo remove dev item
        intSignals.push('gotTurnDetails');
      });


      mewConnectClient.on('RtcConnectedEvent', () => {
        console.log(intSignals); // todo remove dev item

        mewConnectClient.disconnectRTC();
        console.log(intSignals); // todo remove dev item
        // chaiExpect(intSignals).to.be.an('array').to.include.members(['UsingFallback', 'signatureCheck', 'SocketConnectedEvent', 'offerCreated', 'sendOffer', 'answerReceived', 'codeDisplay', 'RtcInitiatedEvent']);

        completed.push('Initiator');
        if (completed.includes('Initiator') && completed.includes('Receiver') && fallbackCalled) {
          done();
        }
      });

      recieverPeer.on('RtcConnectedEvent', () => {
        console.log(intSignals); // todo remove dev item

        recieverPeer.disconnectRTC()
          .then(() => {
            chaiExpect(recSignals).to.be.an('array').to.include.members(['UsingFallback', 'RtcInitiatedEvent', 'signatureCheck']);
            completed.push('Receiver');

            if (completed.includes('Initiator') && completed.includes('Receiver') && fallbackCalled) {
              done();
            }
          })

      });

    });
  });

});
