"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

const SocketContext = createContext({
  socket: null,
  onlineUsers: [],
  notifications: [],
  addNotification: () => {},
  incomingCall: null,
  callState: { active: false, callType: null, peerId: null, peerName: null },
  initiateCall: () => {},
  acceptCall: () => {},
  declineCall: () => {},
  endCall: () => {},
  localVideoRef: null,
  remoteVideoRef: null
});

export function SocketProvider({ children }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // WebRTC Calling State
  const [incomingCall, setIncomingCall] = useState(null);
  const [callState, setCallState] = useState({ active: false, callType: null, peerId: null, peerName: null });
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Add in-app toast notification
  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: Math.random().toString(), ...notif, createdAt: new Date() },
      ...prev
    ]);
  };

  useEffect(() => {
    if (!session?.user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to same host/port
    const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected to Soul Bridge Server:", newSocket.id);
      newSocket.emit("register", session.user.id);
    });

    newSocket.on("online_users_list", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("user_status", ({ userId, status }) => {
      setOnlineUsers((prev) => {
        if (status === "online") {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    });

    newSocket.on("new_notification", (notif) => {
      addNotification(notif);
    });

    // WebRTC Signaling listeners
    newSocket.on("call_incoming", ({ signal, from, name, callType }) => {
      setIncomingCall({ signal, from, name, callType });
    });

    newSocket.on("call_accepted", (signal) => {
      if (peerConnectionRef.current && signal) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal))
          .catch(err => console.error("Error setting remote description on accept:", err));
        setCallState(prev => ({ ...prev, active: true }));
      }
    });

    newSocket.on("call_declined", () => {
      addNotification({
        type: "CALL_REQUEST",
        content: "Call declined."
      });
      cleanupCall();
    });

    newSocket.on("call_ended", () => {
      addNotification({
        type: "CALL_REQUEST",
        content: "Call ended."
      });
      cleanupCall();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?.id]);

  // Clean up WebRTC streams
  const cleanupCall = () => {
    setIncomingCall(null);
    setCallState({ active: false, callType: null, peerId: null, peerName: null });
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // WebRTC Methods
  const initiateCall = async (userToCall, peerName, callType = "video") => {
    try {
      if (!socket) return;
      
      setCallState({ active: false, callType, peerId: userToCall, peerName });
      
      const constraints = {
        audio: true,
        video: callType === "video"
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setCallState(prev => ({ ...prev, active: true }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          // Send ICE candidate signaling if needed, or rely on full offer/answer SDPs
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call_user", {
        userToCall,
        signalData: offer,
        from: session.user.id,
        name: session.user.fullName || "Soul Bridge User",
        callType
      });

    } catch (err) {
      console.error("Failed to start WebRTC Call:", err);
      addNotification({
        type: "CALL_REQUEST",
        content: "Could not access camera/microphone"
      });
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    try {
      if (!socket || !incomingCall) return;

      const { from, signal, callType, name } = incomingCall;
      setCallState({ active: false, callType, peerId: from, peerName: name });
      setIncomingCall(null);

      const constraints = {
        audio: true,
        video: callType === "video"
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setCallState(prev => ({ ...prev, active: true }));
      };

      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer_call", {
        to: from,
        signal: answer
      });

    } catch (err) {
      console.error("Failed to accept WebRTC Call:", err);
      cleanupCall();
    }
  };

  const declineCall = () => {
    if (socket && incomingCall) {
      socket.emit("decline_call", { to: incomingCall.from });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (socket && callState.peerId) {
      socket.emit("end_call", { to: callState.peerId });
    }
    cleanupCall();
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        notifications,
        addNotification,
        incomingCall,
        callState,
        initiateCall,
        acceptCall,
        declineCall,
        endCall,
        localVideoRef,
        remoteVideoRef
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
