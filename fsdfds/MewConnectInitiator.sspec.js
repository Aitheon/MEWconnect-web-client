import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import MewConnect from '../../dist';
import wrtc from 'wrtc'
// import MewConnectCrypto from '../../src/MewConnectCrypto';

// const assert = chai.assert;

describe('usingRedis.test.js', function() {


  // test cases
  it('Add single entry', function(done) {
    let socketManager, socket, signed, params, socketHandshake;

    let setupListeners = function(_socket) {
      _socket.on('handshake', async code => {
        console.log('handshake', code); // todo remove dev item
        signed = await mewCrypto.signMessage(
          mewCrypto.prvt.toString('hex')
        );

        const encryptedVersion = await mewCrypto.encrypt(params.version);
        socket.emit('signature', {
          signed: signed,
          connId: params.connId,
          version: encryptedVersion
        });
        done();
      });

      socket.on('offer', async (_data) => {
        const decryptedOffer = await mewCrypto.decrypt(_data.data);

        const decryptedData = {
          data: decryptedOffer
        };

        const webRtcConfig = _data.options || {};
        const webRtcServers = webRtcConfig.servers || this.stunServers;

        const simpleOptions = {
          initiator: false,
          trickle: false,
          reconnectTimer: 100,
          iceTransportPolicy: 'relay',
          config: {
            iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }]
          },
          wrtc: wrtc
        };

        const p = new SimplePeer(simpleOptions);
        p.signal(JSON.parse(_data.data));

        p.on('error', (_data) => {

        });
        p.on('connect', (_data) => {

        });
        p.on('close', (_data) => {

        });
        p.on('data', (_data) => {

        });
        p.on('signal', (_data) => {

        });

      });
      socket.on('confirmationFailedBusy', (_data) => {

        }
      );
      socket.on('confirmationFailed', (_data) => {

      });
      socket.on('InvalidConnection', (_data) => {

      });
      socket.on('disconnect', (_data) => {

      });
      socket.on('attemptingTurn', (_data) => {

      });
      // Handle Receipt of TURN server details, and begin a WebRTC connection attempt using TURN
      socket.on('turnToken', (_data) => {

      });
    };

    console.log(wrtc); // todo remove dev item
    let mewConnectClient = MewConnect.Initiator.init({rtcOptions: {wrtc: wrtc}});
    let mewCrypto = MewConnect.Crypto.create();

    mewConnectClient.initiatorStart('http://127.0.0.1:8081');

    mewConnectClient.on('codeDisplay', async code => {
      const connParts = code.split('_');
      params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };
      expect(code).toBeTruthy();

      mewCrypto.setPrivate(params.key);
      signed = await mewCrypto.signMessage(params.key);

      const options = {
        query: {
          signed,
          connId: params.connId,
          stage: 'receiver'
        },
        secure: true
      };

      socketManager = io('http://127.0.0.1:8081', options);
      socket = socketManager.connect();
      setupListeners(socket);
    });

    mewConnectClient.on('rtcConnected', () => {
      console.log('congrats you are connected to mew connect!');
    });

  });
//--------------------------------------------------------------------------------------------------
  it('uses fallback', function(done) {
    let socketManager, socket, signed, params, socketHandshake;

    let setupListeners = function(_socket) {

      _socket.on('handshake', async code => {
        console.log('handshake', code); // todo remove dev item
        signed = await mewCrypto.signMessage(
          mewCrypto.prvt.toString('hex')
        );

        socket.emit('tryTurn', { connId: params.connId });
        done();
      });

      // _socket.on('handshake', async code => {
      //   console.log('handshake', code); // todo remove dev item
      //   signed = await mewCrypto.signMessage(
      //     mewCrypto.prvt.toString('hex')
      //   );
      //
      //   const encryptedVersion = await mewCrypto.encrypt(params.version);
      //   socket.emit('signature', {
      //     signed: signed,
      //     connId: params.connId,
      //     version: encryptedVersion
      //   });
      //   done();
      // })
    };

    let mewConnectClient = MewConnect.Initiator.init({rtcOptions: {wrtc: wrtc}});
    let mewCrypto = MewConnect.Crypto.create();

    mewConnectClient.initiatorStart('http://127.0.0.1:8081');

    mewConnectClient.on('codeDisplay', async code => {
      const connParts = code.split('_');
      params = {
        connId: connParts[2].trim(),
        key: connParts[1].trim(),
        version: connParts[0].trim()
      };
      expect(code).toBeTruthy();

      mewCrypto.setPrivate(params.key);
      signed = await mewCrypto.signMessage(params.key);

      const options = {
        query: {
          signed,
          connId: params.connId,
          stage: 'receiver'
        },
        secure: true
      };

      socketManager = io('http://127.0.0.1:8081', options);
      socket = socketManager.connect();
      setupListeners(socket);
    });

    mewConnectClient.on('rtcConnected', () => {
      console.log('congrats you are connected to mew connect!');
    });

  });

  // it('verifies a supplied verification signature', function(done) {
  //
  // });
  //
  // it('Update single entry ', function(done) {
  //
  // });
  //
  // it('Update turn state entry ', function(done) {
  //
  // });
  //
  // it('Removes a single entry ', function(done) {
  //
  // });
});
