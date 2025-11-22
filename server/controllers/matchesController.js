import { success } from "zod";
import { Match } from "../models/Match.js";
import { UserCredentials } from "../models/UserCredentials.js";

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
        const { match_id } = req.params;
        const uderId = req.user.userId;
        const match = await Match.findById(match_id);
        const user = match.user_A._id.toString() === userId ? match.user_A : match.user_B; // Sprawdzamy nadawce 1 like z matcha i porównujemy z zalogownym użytkonikiem
        const messages = await Message.find({
            $or: [
                { from_user: match.user_A._id, to_user: match.user_B._id },
                { from_user: match.user_B._id, to_user: match.user_A._id }
            ]
        }).sort({ created_at: -1 });
        const addressee = match.user_A._id.toString() === userId ? m.user_B : m.user_A;

        return res.status(200).json({
            success: true,
            data: messages,
            to: addressee
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Filed to load chosen conversation."
        });
    }
};

export function sendMessage(req, res){
    // Lowkey nie kminie chyba, musze sie oswiecic jak to maa dobrze dzialac
};

export async function listChats(req, res){
    try {
        const chats = await Promise.all(matches.map(async m => { // Wyszukujemy wszystkie matche + ostatnie wiadomości
            const last_message = Message.findOne({
                $or: [
                    { from_user: m.user_A._id, to_user: m_user_B._id },
                    { from_user: m.user_B._id, to_user: m_user_A._id }
                ]
            }).sort({ created_at: -1 });

            // tlumczylem slowo nadawca zeby to napisacc
            const addressee = m.user_A._id.toString() === userId ? m.user_B : m.user_A; // Jeżeli B to nasz użytkownik to przypisz A i odwrotnie

            return {
                match_id: m._id,
                other_user: addressee,
                last_message: last_message?.content || null,
                last_message_date: last_message?.created_at || null,
                match_date: m.created_at // Nie wiem, czy tego pola możnaa nie skipnąć i pobierać je przy sortowaniu (jeżeli to wpływa niekorzystnie na szybkość działania czy coś nwm nie znam się :((( ))))
            };
        }));

        // TODO zaimplementować lepsze sortowanie
        chats.sort((a, b) => {
            const date_A = a.last_message_date ? new Date(a.last_message_date) : new Date(a.match_date);
            const date_B = b.last_message_date ? new Date(b.last_message_date) : new Date(b.match_date);
            return date_B - date_A;
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