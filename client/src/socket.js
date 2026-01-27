import {io} from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  auth: {
    token: localStorage.getItem("token"),
  },
  autoConnect: true,
});

export default socket;
