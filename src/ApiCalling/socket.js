import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.emit('Connect');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
const socketManager = new SocketManager();
export { socketManager };
