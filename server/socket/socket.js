import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/authMiddleware.js";
import { Match } from "../models/Match.js";
import { Message } from "../models/Message.js";

export default function setupSocket(io) {

  // Autoryzacja, przy łączeniu jest wysyłany token i gdy jest on poprawny to tworzone jest połączenie
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token provided"));

    try {
      socket.user = jwt.verify(token, JWT_SECRET); // socket.user bedzie zawieral wszystkie dane z tokenu
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.userId;
    console.log("User connected:", userId);

    socket.join(`user_${userId}`);

    socket.on("join_chat", async ({ matchId }) => { // Wyybranie/włączenie chatu

      await Message.updateMany( // Update wwiadomosci, ktore mialy flge is_read na false
        { match_id: matchId, to_user: userId, is_read: false },
        { is_read: true }
      );
    });

    socket.on("send_message", async ({ matchId, text }) => {
      const senderId = userId;

      const match = await Match.findById(matchId);
      if (!match) return;

      const receiverId = match.user_A.equals(senderId)
        ? match.user_B
        : match.user_A;

      let message = await Message.create({ // Zapisujemy widomość ww bazie
        match_id: matchId,
        from_user: senderId,
        to_user: receiverId,
        content: text,
        is_read: false
      });

      // Wyśwwietl wiadomość u nadacy
      io.to(`user_${senderId}`).emit("message_sent", message);

      // Wyślij widomość do odbiorcy
      io.to(`user_${receiverId}`).emit("new_message", message);
    });

    socket.on("leave_chat", () => { // Jak nie sledzimy statusu bycia online i otworzonych chatow, to chyba mozna usunac na ten moment
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });
}
