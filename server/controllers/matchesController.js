import { success } from "zod";
import { Match } from "../models/Match.js";
import { UserCredentials } from "../models/UserCredentials.js";
import { Message } from "../models/Message.js";

export async function listMatches(req,res){
    try {
        const user = req.user.userId;
        const matches = await Match.find({
            $or: [
                { user_A: user },
                { user_B: user }
            ]
        })
        .populate("user_A", "name images_paths")
        .populate("user_B", "name images_paths")
        .sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            total: matches.length,
            data: matches
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Failed to load matches."
        });
    }
};

export async function deleteMatch(req,res){
    try {
        const { ids } = req.body;
        const matches = await Match.find({
            _id: { $in: ids } //Nie szukamy po użytkownikach, bo osoba A i B, mogą mieć kilka matchy i zostawić tylko jedno z nich (chyba, że tak nie chcemy)
        })
        const picked_matches = matches.map(m => m._id);
        const deleted_matches = await Match.deleteMany({ _id: { $in: picked_matches } });
        const skipped_matches = ids.filter(id => !picked_matches.includes(id));

        if( skipped_matches.length === 0 ) return res.status(200).json({
            success: true,
            deleted: deleted_matches
        }); 
        else return res.status(204).json({ //Myślałem, że będzie potrzebne, ale jak pomyślałem drugi raz to chyba nie będzie, ale na ten moment zostawie
            succes: true,
            deleted: deleted_matches,
            not_deleted: skipped_matches
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Filed to delete chosen matches."
        });
    }
};

export async function listMessages(req, res){
    try {
        const { matchid } = req.params;
        const userId = req.user.userId;
        const match = await Match.findById(matchid);
        if (!match) return res.status(404).json({ success: false, error: "Match not found" });
        const user = match.user_A._id.toString() === userId ? match.user_A : match.user_B; // Sprawdzamy nadawce 1 like z matcha i porównujemy z zalogownym użytkonikiem
        const messages = await Message.find({
            match_id: matchid,
            $or: [
                { from_user: match.user_A, to_user: match.user_B },
                { from_user: match.user_B, to_user: match.user_A }
            ]
        }).sort({ created_at: -1 });

        const addressee = match.user_A.toString() === userId ? match.user_B : match.user_A;
        const from_who = match.user_A.toString() === userId ? match.user_A : match.user_B;

        return res.status(200).json({
            success: true,
            data: messages,
            to: addressee,
            form: from_who
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Filed to load chosen conversation."
        });
    }
};

//export function sendMessage(req, res){
    // Lowkey nie kminie chyba, musze sie oswiecic jak to maa dobrze dzialac
//};

export async function listChats(req, res){
    try {
        const userId = req.user.userId;
        const matches = await Match.find({
            $or: [
                { user_A: userId },
                { user_B: userId }
            ]
        })
        .populate("user_A", "name images_paths")
        .populate("user_B", "name images_paths");

        const chats = await Promise.all(matches.map(async match => { // Wyszukujemy wszystkie matche + ostatnie wiadomości
            const last_message = await Message.findOne({
                match_id: match_id,
                $or: [
                    { from_user: match.user_A, to_user: match.user_B },
                    { from_user: match.user_B, to_user: match.user_A }
                ]
            }).sort({ created_at: -1 });

            // tlumczylem slowo nadawca zeby to napisacc
            const addressee = match.user_A.toString() === userId ? match.user_B : match.user_A; // Jeżeli B to nasz użytkownik to przypisz A i odwrotnie

            return { // TODO dodać zdjęcie główne użytkownika
                match_id: match._id,
                other_user: addressee,
                last_message: last_message?.content || null,
                last_message_date: last_message?.created_at || null,
                match_date: match.created_at // Nie wiem, czy tego pola możnaa nie skipnąć i pobierać je przy sortowaniu (jeżeli to wpływa niekorzystnie na szybkość działania czy coś nwm nie znam się :((( ))))
            };
        }));

        // TODO zaimplementować lepsze sortowanie
        chats.sort((a, b) => {
            const date_A = a.last_message_date ? new Date(a.last_message_date) : new Date(a.match_date);
            const date_B = b.last_message_date ? new Date(b.last_message_date) : new Date(b.match_date);
            return new Date(date_B) - new Date(date_A);
        });

        return res.status(200).json({ success: true, data: chats });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Filed to load current chats."
        });
    }
};