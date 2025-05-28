// src/components/VideoCall.jsx
import React, { useRef, useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff
} from 'lucide-react';
import './VideoCall.css';  // ← import the CSS below

export default function VideoCall({ roomId, onClose }) {
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef        = useRef(null);
  const unsubRef       = useRef(null);
  const localStreamRef = useRef(null);
  const signaledRef    = useRef({ offer: false, answer: false });

  const [audioEnabled, setAudioEnabled]         = useState(true);
  const [videoEnabled, setVideoEnabled]         = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose }, [onClose]);

  const toggleAudio = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setAudioEnabled(a => !a);
  };
  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setVideoEnabled(v => !v);
  };

  useEffect(() => {
    if (peerRef.current) return;   // only once

    let isMounted = true;
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMounted) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => localVideoRef.current.play().catch(()=>{});

        const roomDoc      = doc(firestore, 'video_calls', roomId);
        const snap         = await getDoc(roomDoc);
        const isInitiator  = !snap.exists();

        const peer = new SimplePeer({
          initiator: isInitiator,
          trickle:   false,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });
        peerRef.current = peer;

        peer.on('signal', async data => {
          if (data.type === 'offer') {
            await setDoc(roomDoc, { offer: JSON.stringify(data) });
          } else if (data.type === 'answer') {
            await updateDoc(roomDoc, { answer: JSON.stringify(data) });
          }
        });

        unsubRef.current = onSnapshot(roomDoc, snap => {
          if (snap.metadata.hasPendingWrites) return;
          const data = snap.data() || {};
          if (!isInitiator && data.offer && !signaledRef.current.offer) {
            signaledRef.current.offer = true;
            peer.signal(JSON.parse(data.offer));
          }
          if (isInitiator && data.answer && !signaledRef.current.answer) {
            signaledRef.current.answer = true;
            peer.signal(JSON.parse(data.answer));
          }
        });

        peer.on('stream', remoteStream => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadedmetadata = () => remoteVideoRef.current.play().catch(()=>{});
          setConnectionStatus('Connected');
        });

        peer.on('connect', () => setConnectionStatus('Connected'));
        peer.on('error', err => setConnectionStatus(`Error: ${err.message}`));
      } catch (err) {
        console.error(err);
        onCloseRef.current();
      }
    };
    init();

    return () => {
      isMounted = false;
      peerRef.current?.destroy();
      unsubRef.current?.();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId]);

  return (
    <div className="video-container position-relative w-100 h-100 bg-black overflow-hidden">
      {/* Remote video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ objectFit: 'cover' }}
      />

      {/* Local preview */}
      <video
        ref={localVideoRef}
        muted
        autoPlay
        playsInline
        className="position-absolute bottom-0 end-0 m-3 border border-white rounded"
        style={{ width: 160, height: 120 }}
      />

      {/* Status */}
      <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-dark bg-opacity-75 text-white rounded small">
        {connectionStatus}
      </div>

      {/* Controls */}
      <div className="position-absolute bottom-0 w-100 d-flex justify-content-center gap-3 p-3  bg-opacity-50">
        <button className="btn btn-light btn-circle shadow" onClick={toggleAudio}>
          {audioEnabled ? <Mic size={20}/> : <MicOff size={20} className="text-danger"/>}
        </button>
        <button className="btn btn-light btn-circle shadow" onClick={toggleVideo}>
          {videoEnabled ? <Video size={20}/> : <VideoOff size={20} className="text-danger"/>}
        </button>
        <button className="btn btn-danger btn-circle shadow" onClick={() => onCloseRef.current()}>
          <PhoneOff size={20} className="text-white"/>
        </button>
      </div>
    </div>
  );
}
