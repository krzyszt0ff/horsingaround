import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { JWT_SECRET } from "../middleware/authMiddleware.js";
import { Match } from "../models/Match.js";
import { Message } from "../models/Message.js";

export default function setupSocket(io) { // Funkcja inicjalizcyjna

  const onlineUsers = new Map(); // Mapa aktywnych użytkowników

  // Autoryzacja socketów
  io.use((socket, next) => {
    cookieParser()(socket.request, {}, () => {
      const token = socket.request.cookies?.token; // token to pobranie JWT z ciasteczka
      if (!token) return next(new Error("No token provided"));
      try {
        socket.user = jwt.verify(token, JWT_SECRET); // Weryfikacja tokenu
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });
  });

  // Połączenie użytkownika
  io.on("connection", (socket) => {
    const userId = socket.user.userId;
    socket.currentChat = null;

    // Zarządzanie statusami online
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());   // Jeżeli użytkownik loguje się, tworzymy nowy set
    }
    onlineUsers.get(userId).add(socket.id); // Jeżeli dochodzi nowy socket użytkownika, dodajemy go bez tworzenia nowej szufladki

    // Sygnał informujący o zalogowaniu się użytkownika
    if (onlineUsers.get(userId).size === 1) {
      io.emit("user_online", userId); // Jeżeli loguje się 1 raz, nie gdy np. dodaje karte w przeglądarce
    }
    
    // Wysyłanie listy aktywnych użytkowników (przy 1 połączeniu)
    const activeUserIds = Array.from(onlineUsers.keys());
    socket.emit("active_users_list", activeUserIds);

    socket.join(`user_${userId}`); // Każdy socket użytkownika jest w 1 pokoju, dzięki czemu nie trzeba wysyłać wiadomości osobno do każdego socketu

    // Dołączanie do chatu
    socket.on("join_chat", async ({ matchId }) => {
      if(socket.currentChat) socket.leave(`chat_${socket.currentChat}`); // Opuszczenie poprzedniego chatu
      socket.currentChat = matchId;   // Ustawienie obecnego chatu
      socket.join(`chat_${matchId}`); // Dołączenie do pokoju
      
      // Oznacz jako przeczytane, po wejściu do pokoju
      // Nie wiem, czy nie można tego usunąć, bo przy wejściu i tak pobierane są wiadomości przez api i są zmieniane właśnie tam
      await Message.updateMany(
        { match_id: matchId, to_user: userId, is_read: false },
        { is_read: true }
      );
    });

    // Opuszczanie chatu
    socket.on("leave_chat", () => {
       if(socket.currentChat) {
           socket.leave(`chat_${socket.currentChat}`);
           socket.currentChat = null; // Wyczyszczenie obecnie otwartego chatu
       }
    });

    // Wysyłanie wiadomości
    socket.on("send_message", async ({ matchId, text }) => {
      console.log(`[SOCKET] Received message for match: ${matchId}`);
      
      try {
        const senderId = userId;
        const match = await Match.findById(matchId);
        if (!match) return;

        const receiverId = match.user_A.equals(senderId) ? match.user_B : match.user_A;
        
        // Sprawdzanie czy odbiorca ma otwarty ten konkretny chat
        const receiverSockets = onlineUsers.get(receiverId.toString()) || new Set();
        let isRead = false;
        
        for (let socketID of receiverSockets) { // Iterowanie po socketach odbiorcy, by sprawdzić czy któryś z nich ma otwarty chat
          const s = io.sockets.sockets.get(socketID);
          if (s?.currentChat === matchId) {
            isRead = true; // Gdy jest otwarty, zmienany od razu stan przy zapisywaniu na odczytany
            break;
          }
        }

        const message = await Message.create({
          match_id: matchId,
          from_user: senderId,
          to_user: receiverId,
          content: text,
          is_read: isRead,
          created_at: new Date()
        });

        // Emitujemy do pokoju odbiorcy
        io.to(`user_${receiverId}`).emit("new_message", message);
        
        // Emitujemy do pokoju nadawcy
        io.to(`user_${senderId}`).emit("message_sent", message);

      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    // Wylogowanie
    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(userId); // Zbiór wszystkich socketów użytkownika
      if (userSockets) {
        userSockets.delete(socket.id); // Usuwamy sockety
        if (userSockets.size === 0) { // Gdy nie ma już socketów, usuwamy id z listy
          onlineUsers.delete(userId);
          io.emit("user_offline", userId); // Emitujemy sygnał o wyjściu użytkownika
        }
      }
    });
  });
}