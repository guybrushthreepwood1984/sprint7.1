declare module 'socket.io' {
  interface Handshake {
    session: Express.Session;
  }
}
