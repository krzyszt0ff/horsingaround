import { Match } from "../models/Match.js";
import { Message } from "../models/Message.js";
import { UserData } from "../models/UserData.js";
import mongoose from 'mongoose';

export async function listMatches(req,res){
    try {
        // Pobieranie danych + szukanie matcha, którego częścią jest użytkownik
        const user = new mongoose.Types.ObjectId(req.user.userId);
        const matches = await Match.aggregate([
            { $match: { $or: [ { user_A: user }, { user_B: user }]}},
            {
                $lookup: { // Dołączamy tabele userdatas, by mieć dostęp do zdjęć i nazwy
                    from: "userdatas",
                    localField: "user_A",
                    foreignField: "user_id",
                    as: "dataA"
                }
            },
            { $unwind: "$dataA" }, // Zmiana z tablicy na obiekt (lookup zawsze zwraca tablice, nawet jak jest jeden wynik)
            {
                $lookup: { // Dołączamy ją dla obydwu użytkowników z danego matcha
                    from: "userdatas",
                    localField: "user_B",
                    foreignField: "user_id",
                    as: "dataB"
                }
            },
            { $unwind: "$dataB" },
            {
                $project: { // Wybieranie drugiego użytkownika
                    _id: 1, // Zostawiamy id (1-zostawic, 0-usunac)
                    created_at: 1,
                    other_user: {
                        $cond: {
                            if: { $eq: ["$user_A", user]},
                            then: "$dataB",
                            else: "$dataA"
                        }
                    }
                }
            },

            { $sort: { created_at: -1 }} // Sortujemy od najnowszych
        ]);

        return res.status(200).json({
            success: true,
            total: matches.length,
            data: matches // match._id / .created_at / .other_user.name / .other_user.imges_paths itp
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Failed to load matches."
        });
    }
};

export async function deleteMatch(req, res) {
    try {
        const ids = req.body.ids; 
        
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, error: "Invalid IDs format" });
        }
        await Message.deleteMany({ match_id: { $in: ids } });
        const deletedResult = await Match.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({ 
            success: true,
            deletedCount: deletedResult.deletedCount 
        });

    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({
            success: false,
            error: "Failed to delete chosen matches."
        });
    }
};

export async function listMessages(req, res) {
  try {
    const { matchid } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const match = await Match.findById(matchid);
    if (!match) return res.status(404).json({ success: false, error: "Match not found" });

    const messages = await Message.find({ match_id: matchid }).sort({ created_at: -1 });

    await Message.updateMany( // Update wszystkich wiadomości po pobraniu, które były na unread
      {
        match_id: matchid,
        to_user: userId,
        is_read: false
      },
      { $set: { is_read: true } }
    );

    const user = await UserData.findOne({ user_id: match.user_A.equals(userId) ? match.user_A : match.user_B });
    const addressee = await UserData.findOne({ user_id: match.user_A.equals(userId) ? match.user_B : match.user_A });

    return res.status(200).json({
        success: true,
        data: messages,
        user,
        addressee
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to load chosen conversation." });
  }
};


export async function listChats(req, res) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const matches = await Match.find({
      $or: [
        { user_A: userId },
        { user_B: userId }
      ]
    });

    const chats = await Promise.all(matches.map(async match => {
      const last_message = await Message.findOne({ match_id: match._id }).sort({ created_at: -1 });

      const otherUserId = match.user_A.equals(userId) ? match.user_B : match.user_A;

      const otherUser = await UserData.findOne({ user_id: otherUserId });

      return {
        match_id: match._id,
        other_user: otherUser,
        last_message: last_message?.content || null,
        last_message_date: last_message?.created_at || null,
        has_unread: last_message ? (!last_message.is_read && !last_message.from_user.equals(userId)) : false, // Flaga posiadania nieodczytanych wiadomości
        match_date: match.created_at
      };
    }));

    chats.sort((a, b) => { // Sortowanie chatów od najnowszych
      const dateA = a.last_message_date || a.match_date;
      const dateB = b.last_message_date || b.match_date;
      return new Date(dateB) - new Date(dateA);
    });

    return res.status(200).json({ success: true, data: chats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to load current chats." });
  }
};