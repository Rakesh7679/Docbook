import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import io from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreatePrescriptionModal from './CreatePrescriptionModal';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const DoctorConsultation = () => {
  const { appointmentId } = useParams();
  const { dToken, backendUrl } = useContext(DoctorContext);
  const navigate = useNavigate();

  const [consultationData, setConsultationData] = useState(null);
  const [callStatus, setCallStatus] = useState('Initializing doctor consultation room...');
  const [peerConnected, setPeerConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteAudioMuted, setRemoteAudioMuted] = useState(false);
  const [remoteVideoOff, setRemoteVideoOff] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  const iceCandidatesQueue = useRef([]);

  useEffect(() => {
    let isMounted = true;

    const initConsultation = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/consultation/room/${appointmentId}`,
          { headers: { dtoken: dToken } }
        );

        if (!data.success) {
          toast.error(data.message || 'Unauthorized consultation access');
          navigate('/doctor-appointments');
          return;
        }

        if (isMounted) {
          setConsultationData(data.consultation);
          setupMediaAndSocket(data.consultation);
        }
      } catch (err) {
        console.error('Doctor consultation init error:', err);
        toast.error('Failed to join room');
        navigate('/doctor-appointments');
      }
    };

    initConsultation();

    return () => {
      isMounted = false;
      cleanupCall();
    };
  }, [appointmentId, dToken]);

  const setupMediaAndSocket = async (consultation) => {
    try {
      // 1. Get doctor media stream with enhanced audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 2. Connect Socket.IO
      const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        setCallStatus('Waiting for patient to join...');
        socket.emit('join-room', {
          roomId: consultation.roomId,
          userId: consultation.doctorId,
          userName: `Dr. ${consultation.docData?.name || 'Doctor'}`,
          role: 'doctor'
        });
      });

      socket.on('user-joined', async ({ userName, role }) => {
        toast.info(`${userName} (${role}) has joined`);
        setCallStatus(`Patient connected (${userName})`);
        createOffer(socket, consultation.roomId);
      });

      socket.on('existing-participants', () => {
        setCallStatus('Patient is in room. Establishing video stream...');
        createOffer(socket, consultation.roomId);
      });

      socket.on('receive-offer', async ({ offer }) => {
        await handleReceiveOffer(socket, consultation.roomId, offer);
      });

      socket.on('receive-answer', async ({ answer }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          processQueuedIceCandidates();
          setPeerConnected(true);
          setCallStatus('Consultation in progress');
        }
      });

      socket.on('receive-ice-candidate', async ({ candidate }) => {
        if (!candidate) return;
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      });

      socket.on('user-toggled-audio', ({ isMuted }) => {
        setRemoteAudioMuted(isMuted);
      });

      socket.on('user-toggled-video', ({ isVideoOff }) => {
        setRemoteVideoOff(isVideoOff);
      });

      socket.on('consultation-ended', ({ endedBy }) => {
        toast.info(`Consultation ended by ${endedBy}`);
        cleanupCall();
        navigate('/doctor-appointments');
      });

      socket.on('user-left', ({ userName }) => {
        toast.warn(`${userName} left the call`);
        setPeerConnected(false);
        setCallStatus('Patient disconnected');
      });

    } catch (mediaErr) {
      console.error('Camera/Mic error:', mediaErr);
      toast.error('Unable to access camera or microphone. Please check browser permissions.');
      setCallStatus('Media Device Error');
    }
  };

  const processQueuedIceCandidates = async () => {
    while (iceCandidatesQueue.current.length > 0 && peerConnectionRef.current?.remoteDescription) {
      const candidate = iceCandidatesQueue.current.shift();
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error processing queued ICE candidate:', e);
      }
    }
  };

  const createPeerConnection = (socket, roomId) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(err => console.log('Remote stream play error:', err));
        setPeerConnected(true);
        setCallStatus('Consultation in progress');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send-ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const createOffer = async (socket, roomId) => {
    const pc = createPeerConnection(socket, roomId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('send-offer', { roomId, offer });
  };

  const handleReceiveOffer = async (socket, roomId, offer) => {
    const pc = createPeerConnection(socket, roomId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    processQueuedIceCandidates();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('send-answer', { roomId, answer });
  };

  const toggleMuteAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuted = !audioTrack.enabled;
        setIsAudioMuted(newMuted);
        socketRef.current?.emit('toggle-audio', {
          roomId: consultationData?.roomId,
          isMuted: newMuted
        });
      }
    }
  };

  const toggleDisableVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newVideoOff = !videoTrack.enabled;
        setIsVideoOff(newVideoOff);
        socketRef.current?.emit('toggle-video', {
          roomId: consultationData?.roomId,
          isVideoOff: newVideoOff
        });
      }
    }
  };

  const endCall = async () => {
    if (socketRef.current && consultationData?.roomId) {
      socketRef.current.emit('end-consultation', { roomId: consultationData.roomId });
    }
    try {
      await axios.post(
        `${backendUrl}/api/consultation/end`,
        { appointmentId, roomId: consultationData?.roomId },
        { headers: { dtoken: dToken } }
      );
    } catch (e) {
      console.error('End consultation API error:', e);
    }
    cleanupCall();
    navigate('/doctor-appointments');
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-6xl m-5 bg-slate-900 text-white rounded-2xl overflow-hidden flex flex-col shadow-2xl min-h-[82vh]">
      {/* Top Header Bar */}
      <div className="bg-slate-800/90 border-b border-slate-700 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg">
            👤
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg leading-tight">
              Patient: {consultationData?.userData?.name || 'Patient'}
            </h2>
            <p className="text-xs text-slate-400">
              Appt Slot: {consultationData?.slotDate} ({consultationData?.slotTime})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>📝</span>
            <span>Create Prescription</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-700 text-xs font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${peerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>{callStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="flex-1 relative bg-black flex items-center justify-center p-2 min-h-[420px]">
        {/* Remote Video (Patient) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover rounded-xl ${remoteVideoOff ? 'hidden' : 'block'}`}
        />

        {/* Remote Placeholder */}
        {(!peerConnected || remoteVideoOff) && (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-4xl mb-3 shadow-lg">
              👤
            </div>
            <h3 className="font-semibold text-lg text-white mb-1">
              {consultationData?.userData?.name || 'Patient'}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              {remoteVideoOff ? 'Patient has turned off camera' : 'Waiting for patient to join video room...'}
            </p>
          </div>
        )}

        {/* Local Video Picture-in-Picture (Doctor Overlay) */}
        <div className="absolute bottom-4 right-4 w-36 sm:w-48 h-28 sm:h-36 bg-slate-800 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
          {isVideoOff && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-xs text-slate-400">
              <span className="text-xl mb-1">📷</span>
              Camera Off
            </div>
          )}
          <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-medium backdrop-blur-xs">
            You (Doctor)
          </div>
        </div>
      </div>

      {/* Control Bar Footer */}
      <div className="bg-slate-800/90 border-t border-slate-700 p-4 flex items-center justify-center gap-6">
        <button
          onClick={toggleMuteAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${
            isAudioMuted ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? '🔇' : '🎙️'}
        </button>

        <button
          onClick={toggleDisableVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${
            isVideoOff ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
          title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoOff ? '🚫' : '📹'}
        </button>

        <button
          onClick={endCall}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 cursor-pointer"
        >
          <span className="text-xl">📞</span>
          <span>End Consultation</span>
        </button>
      </div>

      {/* Create Prescription Modal */}
      {showPrescriptionModal && consultationData && (
        <CreatePrescriptionModal
          appointment={{
            _id: consultationData.appointmentId,
            userData: consultationData.userData,
            slotDate: consultationData.slotDate,
            slotTime: consultationData.slotTime
          }}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => toast.success("Prescription recorded for patient")}
        />
      )}
    </div>
  );
};

export default DoctorConsultation;
