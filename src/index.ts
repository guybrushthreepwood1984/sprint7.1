import express, { Request, Response } from 'express';
import session from 'express-session';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { Socket } from 'node:dgram';
import cors from 'cors';
import { isStringObject } from 'node:util/types';
import {
  connectDB,
  newUser,
  addMessage
} from './infrastructure/database/update_db';
import { SessionOperation } from 'mongoose';

connectDB();

const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {}
});

declare module 'express-session' {
  export interface SessionData {
    username: string;
  }
}

declare module 'express-serve-static-core' {
  export interface Request {
    session: session.Session & Partial<session.SessionData>;
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(
  `output of: const __dirname = dirname(fileURLToPath(import.meta.url)) is: ${__dirname}`
);

app.get('/login', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'login.html'));
});

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username && password) {
    try {
      await newUser(username, password);
      req.session.username = username;
      res.json({ success: true });
      console.log({ username: username, password: password });
      res.status(201);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Not possible to create user' });
    }
  }
});
app.get('/room', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// app.post('/room', async (req: Request, res: Response) => {});

io.on('connection', async (socket) => {
  const username = session.username;
  let room = socket.handshake.query.room || 'defaultRoom';
  console.log(`Socket.IO username is ${username}`);
  socket.on('switchRoom', (newRoom) => {
    socket.leave(room);
    socket.join(newRoom);
    room = newRoom;
    console.log(`User ${username} switched to room ${newRoom}`);
  });
  socket.on('chat message', async (msg, clientOffset, callback) => {
    io.emit('chat message', msg);
    addMessage(username, msg, clientOffset, room);
    callback();
  });

  socket.on('disconnect', () => {
    console.log(`A user has disconnected`);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
