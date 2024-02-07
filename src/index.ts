import express from 'express';
import { Request, Response } from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { Socket } from 'node:dgram';
import cors from 'cors';
import { isStringObject } from 'node:util/types';
import {
  connectDB,
  newUser,
  addMessage
} from './infrastructure/database/update_db';

connectDB();
async function insertData() {
  await newUser('Michi', 'password');
  await addMessage('Michi', 'message1', 'offset1', 'chatroom1');
}

insertData();

const app = express();
app.use(cors());
const server = createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', async (socket) => {
  socket.on('chat message', async (msg, clientOffset, callback) => {
    io.emit('chat message', msg /*result.lastID*/);
    callback();
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
