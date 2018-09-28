



module.exports = async function(globalConfig){
  console.log(globalConfig); // todo remove dev item
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
};
