import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { Message } from "./models/Message.js";

const JWT_SECRET = "bardzosekretnysekret";

export function initWS(server){
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        const token = new URL(req.url, "http://localhost").searchParams.get("token");

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            ws.userId = decoded.userId;
        } catch (err) {
            ws.close(1008, "Invalid token");
            return;
        }

        ws.on("message", async (raw) => {
            try {
                const data = JSON.parse(raw);

                if(data.type === "message") {
                    const msg = await Message.create({
                        match_id: data.match_id,
                        from_user: ws.userId,
                        to_user: data.to_user,
                        content: data.content,
                        created_at: new Date()
                    });

                    wss.clients.forEach(client => {
                        if (client.readyState === 1 && (client.userId === data.to_user || client.userId === ws.userId)) {
                            client.send(JSON.stringify({
                                type: "new_message",
                                match_id: data.match_id,
                                from_user: ws.userId,
                                content: data.content,
                                created_at: msg.created_at
                            }))
                        }
                    });
                }
            } catch (err) {

            }
        });

        ws.on("close", () => {
        console.log('User ${ws.userId} disconnected');
    });
    });

    console.log("Websocket server initilized");
}
