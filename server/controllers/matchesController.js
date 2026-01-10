import { Match } from "../models/Match.js";
import { Message } from "../models/Message.js";
import { UserData } from "../models/UserData.js";
import mongoose from 'mongoose';

export async function listMatches(req,res){
    try {
        // Pobieraanie danych + szukanie matcha, którego częścią jest zalogowaany użytkownik
        const user = new mongoose.Types.ObjectId(req.user.userId);
        const matches = await Match.aggregate([ // Łączymy tabele, populate nie pojdzie, bo jednak ww Match odwolujemy sie do Credentials a nie Data
            { $match: { $or: [ { user_A: user }, { user_B: user }]}}, //bierzmy tylko matche, które mają naszego user'a za user_A/B

            {
                $lookup: { // Dołączamy tabele userdataas, by mieć dostęp do zdjęć i nazwy (mamy dostep do wszystkich pol bo na ten moment nie wwiem jak wybrac kilka pojedynczych)
                    from: "userdatas", // tabela, którą dołączaamy
                    localField: "user_A", // jakie pole sprawwdzamy przy łączeniu
                    foreignField: "user_id", // jkie pole w drugiej tabeli sprawwdzamy przy łączeniu - WAŻNE jest to, że obywa pola są mongoose.Types.ObjectId
                    as: "dataA" // jak zapisujemy to połączenie, teraz mozemy wwyszukac match.data.name i bedzie dzialac chyba, chybaa mogloby (prosze)
                }
            },
            { $unwind: "$dataA" }, // Zwraca zawsze 1 zmienna, wiec nie potrzebujemy taablicy

            {
                $lookup: {
                    from: "userdatas",
                    localField: "user_B",
                    foreignField: "user_id",
                    as: "dataB"
                }
            },
            { $unwind: "$dataB" },

            {
                $project: {
                    _id: 1, // Zostawiamy id (1-zsotawic, 0-usunac)
                    created_at: 1,
                    other_user: {
                        $cond: { // warunek
                            if: { $eq: ["$user_A", user]},
                            then: "$dataB",
                            else: "$dataA"
                        }
                    }
                }
            },

            { $sort: { created_at: -1 }} // Sortujemy od najnowszych
        ]);

        // Zwracamy JSONka
        return res.status(200).json({
            success: true,
            total: matches.length,
            data: matches // match._id / .created_at / .other_user.name / .other_user.imges_paths itp
        });

    } catch (err) { // Zwracamy JSONkaa ale z błędem :(
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Failed to load matches."
        });
    }
};

export async function deleteMatch(req,res){
    try {
        const ids = req.body.ids; // wyciągamy z JSONa tablicę z id, które mamy usunąć, dzięki temu możemy usunąć kilka na raz zamiast po jednym
        const matches = await Match.find({ // szukaamy matchy do usunięcia
            _id: { $in: ids }
        })
        const picked_matches = matches.map(m => m._id); // tablica samych id matchy, ktore mamy usunac (mapujemy same id)
        const deleted_matches = await Match.deleteMany({ _id: { $in: picked_matches } }); // Usuwanie obiektów + counter
        const skipped_matches = ids.filter(id => !picked_matches.includes(id)); // Wybrane id, które nie zostały usunięte (nie było ich bo nie było ich w bazie), szczerze nie wiem po co to jak terz na to ptrze, chyba mozna usunac

        return res.status(200).json({ 
            success: true,
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
        // Pobieraanie danych + szukanie wybranego matcha z listy
        const { matchid } = req.params;
        const userId = req.user.userId;
        const match = await Match.findById(matchid);

        // Brak szuknego match'a w bazie - zwróć błąd
        if (!match) return res.status(404).json({ success: false, error: "Match not found" });

        // Wyszukiwanie wszystkich wiadomości dla danego chatu/matcha + sortowanie od najnowszej
        const messages = await Message.find({ match_id: matchid }).sort({ created_at: -1 });

        // Updaate nieodczytanych wiadomosci
        await Message.updateMany(
            {
                match_id: matchid,
                to_user: new mongoose.Types.ObjectId(userId),
                is_read: false // Bierzemy wszystkie widomosci, ktore byly wyslane do nszego uzytkowwnika i ktore byly na unread i zmienimy n przeczytane
            },
            {
                $set: { is_read: true }
            }
        );
        // Wyciągamy obiekt 1 uczesstnik rozmowy
        const user_a = await UserData.findById(userId.toString());

        // Wyciągamy id drugiego uczestnika rozmowy
        const userId_b = match.user_A.toString() === userId ? match.user_B : match.user_A;

        // Wyciągamy obiekt drugiego uczestnik rozmowy
        const user_b = await UserData.findById(userId_b.toString());

        // To realnie chyba nie ma sensu, chybaze ma i wczesniej mialem jakas inn czakre otwrta i teraz mam zamknieta banie
        //const from_who = match.user_A.toString() === userId ? match.user_A : match.user_B;

        // Zwracamy JSONka do frontu
        return res.status(200).json({
            success: true,
            data: messages,
            user: user_a, // Będziemy potrzebowali i tak zawsze zdjecia obydwu rozmowcow wiec wypadaloby przeslac obiekt jednego i drugiego, chybaze przydaa sie tylko jeden le wwtedy to troche creepy
            addressee: user_b, // Naadal nie pamietam jk to napisac
            //form: from_who
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Filed to load chosen conversation."
        });
    }
};

export async function listChats(req, res){
    try {
        const userId = req.user.userId; // Pobieramy id użytkownika
        const matches = await Match.find({ // Szukamy matchy, których ten użytkownik jest częścią
            $or: [
                { user_A: userId },
                { user_B: userId }
            ]
        });

        const chats = await Promise.all(matches.map(async match => { // Mapujemy listę matchy ale z promise
            const last_message = await Message.findOne({ match_id: match._id }).sort({ created_at: -1 }); // bo dla kazdego matcha wycigamy jego ostatnią widomość

            // match.user_A ma tylko _id, wwiec nie trzeba dodawac .user_id gdy go nawwet nie ma
            const userB = match.user_A.toString() === userId ? match.user_B : match.user_A;
            const user_b = await UserData.findById(userB.toString());

            return { // TODO dodać zdjęcie główne użytkownika, juz mozna sie odwwolywc do calego obiektu uzytkowwnika wwiec chyba jest okej
                match_id: match._id,
                other_user: user_b,
                last_message: last_message?.content || null,
                last_message_date: last_message?.created_at || null,
                match_date: match.created_at // Nie wiem, czy tego pola możnaa nie skipnąć i pobierać je przy sortowaniu (jeżeli to wpływa niekorzystnie na szybkość działania czy coś nwm nie znam się :((( ))))
            };
        }));

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