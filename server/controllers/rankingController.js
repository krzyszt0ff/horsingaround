import { success } from "zod";
import { Match } from "../models/Match.js";
import { Like } from "../models/Like.js";
import { UserData } from "../models/UserData.js";
import mongoose from 'mongoose';

export async function rankLikes(req,res){
    try {
        const gender = req.params.gender;

        const ranking = await Like.aggregate([
            {
                $group: {                               // Grupowanie like'ów względem użytkowników
                    _id: '$to_user',
                    likesCounter: { $sum: 1 }
                }
            },
            {
                $lookup: {                              // Dołączenie tabeli userdatas
                    from: UserData.collection.name,
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_info"
                }
            },
            { $unwind: "$user_info" },                  // Rozbicie tablicy user_info na obiekt
            { $match: { "user_info.gender": gender } }, // Filtrowanie po płci
            { $sort: { likesCounter: -1 } },            // Sortowanie malejąco
            { $limit: 100 },                            // Ograniczenie, tylko 100 wyników
            {
                $project: {                             // Formatowanie wyniku agregate
                    _id: 0,
                    user_info: 1,
                    likesCounter: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: ranking
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Failed to load ranking."
        });
    }
};

export async function rankMatches(req,res){
    try {
        const gender = req.params.gender;

        const ranking = await Match.aggregate([
            {
                $group: {                               // Grupowanie mtchy względem użytkowników
                    _id: '$user_B',
                    matchesCounter: { $sum: 1 }
                }
            },
            {
                $lookup: {                              // Dołączenie tabeli userdatas
                    from: "userdatas",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_info"
                }
            },
            { $unwind: "$user_info" },                  // Rozbicie tablicy user_info na obiekt
            { $match: { "user_info.gender": gender } }, // Filtrowanie po płci
            { $sort: { matchesCounter: -1 } },          // Sortowanie malejąco
            { $limit: 100 },                            // Ograniczenie, tylko 100 wyników
            {
                $project: {                             // Formatowanie wyniku agregate
                    _id: 0,
                    user_info: 1,
                    matchesCounter: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: ranking
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Failed to load ranking."
        });
    }
};