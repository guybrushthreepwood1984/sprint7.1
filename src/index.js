"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
var express_1 = require("express");
var express_session_1 = require("express-session");
var express_socket_io_session_1 = require("express-socket.io-session");
var node_http_1 = require("node:http");
var node_url_1 = require("node:url");
var node_path_1 = require("node:path");
var socket_io_1 = require("socket.io");
var cors_1 = require("cors");
var update_db_1 = require("./infrastructure/database/update_db");
(0, update_db_1.connectDB)();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
var server = (0, node_http_1.createServer)(app);
exports.io = new socket_io_1.Server(server, {
    connectionStateRecovery: {}
});
var expressSession = (0, express_session_1.default)({
    secret: 'my secret',
    resave: false,
    saveUninitialized: true
});
app.use(expressSession);
exports.io.use((0, express_socket_io_session_1.default)(expressSession, {
    autoSave: true
}));
var __dirname = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
app.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password;
                req.session.username = username;
                if (!(username && password)) return [3 /*break*/, 4];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, update_db_1.newUser)(username, password)];
            case 2:
                _b.sent();
                res.json({ success: true });
                console.log({ username: username, password: password });
                res.status(201);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.log(error_1);
                res.status(500).send({ error: 'Not possible to create user' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/login', function (_req, res) {
    res.sendFile((0, node_path_1.join)(__dirname, 'login.html'));
});
app.get('/room', function (req, res) {
    res.sendFile((0, node_path_1.join)(__dirname, 'index.html'));
});
exports.io.on('connection', function (socket) { return __awaiter(void 0, void 0, void 0, function () {
    var room, username;
    return __generator(this, function (_a) {
        room = 'aceraRoom';
        socket.leave(room);
        socket.join(room);
        username = socket.handshake.session.username;
        console.log("socket.handshake.session.username ".concat(username));
        socket.on('switchRoom', function (newRoom, callback) {
            socket.leave(room);
            socket.join(newRoom);
            room = newRoom;
            console.log("User ".concat(username, " switched to room ").concat(newRoom));
            callback();
        });
        socket.on('chat message', function (msg, clientOffset, callback) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("msg in socket.on 'chat message' is ".concat(msg, " and room is ").concat(room));
                        exports.io.to(room).emit('chat message', msg);
                        return [4 /*yield*/, (0, update_db_1.addMessage)(username, msg, clientOffset, room)];
                    case 1:
                        _a.sent();
                        callback();
                        return [2 /*return*/];
                }
            });
        }); });
        socket.on('disconnect', function () {
            console.log("A user has disconnected");
        });
        return [2 /*return*/];
    });
}); });
var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log("server running at http://localhost:".concat(port));
});
