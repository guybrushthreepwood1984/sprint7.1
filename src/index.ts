import express, { Request, Response } from 'express';
import session from 'express-session';
import sharedsession from 'express-socket.io-session';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  connectDB,
  newUser,
  addMessage
} from './infrastructure/database/update_db';

connectDB();

// declare module 'socket.io' {
//   export interface Socket {}
// }
// import { Socket } from 'socket.io';
// import { isStringObject } from 'node:util/types';

// app.post('/', (req: Request, res: Response) => {
//   res.sendFile(join(__dirname + '/index.html'));
//   const data = req.body;
//   res.status(201).send(data);
// });

const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {}
});

const expressSession = session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: true
});

app.use(expressSession);

io.use(
  sharedsession(expressSession, {
    autoSave: true
  })
);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  req.session.username = username;
  if (username && password) {
    try {
      await newUser(username, password);
      res.json({ success: true });
      console.log({ username: username, password: password });
      res.status(201);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Not possible to create user' });
    }
  }
});

app.get('/login', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'login.html'));
});

app.get('/room', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.post('/room', async (req: Request, res: Response) => {});

io.on('connection', async (socket) => {
  let room = socket.handshake.query.room || 'defaultRoom';
  const username = socket.handshake.session.username;
  console.log(`socket.handshake.session.username ${username}`);
  socket.on('switchRoom', (newRoom) => {
    socket.leave(room);
    socket.join(newRoom);
    room = newRoom;
    console.log(`User ${username} switched to room ${newRoom}`);
  });
  socket.on('chat message', async (msg, clientOffset, callback) => {
    console.log(
      `msg in socket.on 'chat message' is ${msg} and room is ${room}`
    );
    io.to(room).emit('chat message', msg);
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
