/**
 * Socket.IO Handler for WebRTC Video Consultation Signaling
 */
export const setupConsultationSocket = (io) => {
  const roomParticipants = new Map(); // roomId => set of socket.id

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join Consultation Room
    socket.on("join-room", ({ roomId, userId, userName, role }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      socket.userName = userName;
      socket.role = role;

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Set());
      }
      roomParticipants.get(roomId).add(socket.id);

      const roomSize = roomParticipants.get(roomId).size;
      console.log(`User ${userName} (${role}) joined room ${roomId}. Room size: ${roomSize}`);

      // Notify existing users in the room
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
        userName,
        role
      });

      // If there are already other users, notify the new joiner about them
      const otherSockets = Array.from(roomParticipants.get(roomId)).filter(id => id !== socket.id);
      if (otherSockets.length > 0) {
        socket.emit("existing-participants", {
          count: otherSockets.length
        });
      }
    });

    // WebRTC Signaling: Offer
    socket.on("send-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("receive-offer", {
        offer,
        senderSocketId: socket.id,
        senderName: socket.userName,
        senderRole: socket.role
      });
    });

    // WebRTC Signaling: Answer
    socket.on("send-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("receive-answer", {
        answer,
        senderSocketId: socket.id
      });
    });

    // ICE Candidate Exchange
    socket.on("send-ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("receive-ice-candidate", {
        candidate,
        senderSocketId: socket.id
      });
    });

    // Audio / Mic Toggle state notification
    socket.on("toggle-audio", ({ roomId, isMuted }) => {
      socket.to(roomId).emit("user-toggled-audio", {
        socketId: socket.id,
        isMuted
      });
    });

    // Video / Camera Toggle state notification
    socket.on("toggle-video", ({ roomId, isVideoOff }) => {
      socket.to(roomId).emit("user-toggled-video", {
        socketId: socket.id,
        isVideoOff
      });
    });

    // End Consultation Call
    socket.on("end-consultation", ({ roomId }) => {
      io.in(roomId).emit("consultation-ended", {
        endedBy: socket.userName,
        role: socket.role
      });
    });

    // Handle Disconnect / Leave
    socket.on("leave-room", ({ roomId }) => {
      handleUserLeave(socket, roomId);
    });

    socket.on("disconnect", () => {
      if (socket.roomId) {
        handleUserLeave(socket, socket.roomId);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });

    function handleUserLeave(socketInstance, roomId) {
      socketInstance.leave(roomId);
      if (roomParticipants.has(roomId)) {
        roomParticipants.get(roomId).delete(socketInstance.id);
        if (roomParticipants.get(roomId).size === 0) {
          roomParticipants.delete(roomId);
        }
      }
      socketInstance.to(roomId).emit("user-left", {
        socketId: socketInstance.id,
        userName: socketInstance.userName,
        role: socketInstance.role
      });
    }
  });
};
