import {io} from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false, // Change to false
});

// Helper to update token and connect
export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (token) {
    socket.auth = {token};
    socket.connect();
  }
};

export default socket;
