declare module 'socket.io' {
  interface Handshake {
    session: Express.Session;
  }
}

declare module 'express-session' {
  interface SessionData {
    username: string;
  }
}
