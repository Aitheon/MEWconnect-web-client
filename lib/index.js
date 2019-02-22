const signalUrl = typeof signalServer !== 'undefined' ? signalServer : 'https://connect.mewapi.io';

const mewConnectClient = MewConnect.Initiator.init();

mewConnectClient.initiatorStart(signalUrl);

mewConnectClient.on('codeDisplay', code => {
  console.log('mew connect - started');
  const connParts = code.split('_');
  const params = {
    connId: connParts[2].trim(),
    key: connParts[1].trim(),
    version: connParts[0].trim()
  };
  console.log('code:', code);
  console.log('params:', params);
  mewConnectClient.on('RtcConnectedEvent', function () {
    console.log('mew connected');
    mewConnectClient.sendRtcMessage('address', '');
    mewConnectClient.once('address', data => {
      console.log(data.address);
      console.log('data:', data);
    });
  })
})