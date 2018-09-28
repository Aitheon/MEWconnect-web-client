import '@babel/polyfill'
import * as MewConnectSrc from '../../src';
import MewConnectReceiver from '../helpers/MewConnectReceiver';
import { expect } from 'chai';

if(typeof mocha === 'undefined'){
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
    },
  });

}

describe('Check Base Connection Operation', function() {
  const MewConnect = MewConnectSrc.default.Initiator;

  it('should connect', function(done) {
    if(typeof mocha !== 'undefined') this.timeout(5000);
    let mewConnectClient = MewConnect.init();
    let recieverPeer = new MewConnectReceiver();
    mewConnectClient.initiatorStart('https://172.20.0.24');
    mewConnectClient.on('codeDisplay', code => {
      const connParts = code.split('_');
      let params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };



      setTimeout(() => {
        recieverPeer.receiverStart('https://172.20.0.24', params);
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
        done();
      });

    });
  });

  it('should call fallback', function (done) {
    if(typeof mocha !== 'undefined') this.timeout(5000);
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

});
