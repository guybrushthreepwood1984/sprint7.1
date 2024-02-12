import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import cors from 'cors';
import { isStringObject } from 'node:util/types';
import {
  connectDB,
  newUser,
  addMessage
} from './infrastructure/database/update_db';

connectDB();

// declare module 'socket.io' {
//   export interface Socket {}
// }

const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(
  `output of: const __dirname = dirname(fileURLToPath(import.meta.url)) is: ${__dirname}`
);

const userMap = new Map<string, string>();

app.get('/login', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'login.html'));
});

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
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

app.get('/room', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.post('/room', async (req: Request, res: Response) => {});

// app.post('/', (req: Request, res: Response) => {
//   res.sendFile(join(__dirname + '/index.html'));
//   const data = req.body;
//   res.status(201).send(data);
// });

// io.use((socket, next) => {
//   next();
// });

io.on('connection', async (socket) => {
  // socket.on('login', async ({ username, password }) => {
  //   try {
  //     await newUser(username, password); // Assuming this handles db operation
  //     userMap.set(socket.id, username);
  //     socket.emit('loginSuccess'); // Signal success to the client
  //     console.log(`User ${username} logged in`);
  //   } catch (error) {
  //     console.log(error);
  //     socket.emit('loginError', { error: 'Login failed' }); // Error to client
  //   }
  //  if (socket.id === socketId) {
  //    userMap.set(socketId, username);
  //  }

  let room = socket.handshake.query.room || 'defaultRoom';
  // const username = userMap.get(socket.id);
  // console.log(`username from userMap.get(socket.id) is ${username}`);
  const username = socket.handshake.query.username;
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
