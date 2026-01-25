import { success } from "zod";
import { Match } from "../models/Match.js";
import { Like } from "../models/Like.js";
import { UserData } from "../models/UserData.js";
import mongoose from 'mongoose';

export async function statLikes(req,res){
    try {
        const gender = req.params.gender;
        const minAge = parseInt(req.query.minAge) || 18;
        const maxAge = parseInt(req.query.maxAge) || 100;

        const today = new Date();
        const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - minAge - 1, today.getMonth(), today.getDate());

        const ranking = await Like.aggregate([
            {
                $group: {
                    _id: '$to_user',
                    likesCounter: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: UserData.collection.name,
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_info"
                }
            },
            { $unwind: "$user_info" },                  // Rozbicie tablicy user_info na obiekt
            {
                $match: {
                    $and: [
                        ...(gender !== 'all' ? [{ "user_info.gender": gender }] : []),
                        { "user_info.date_of_birth": { $gte: minDate, $lte: maxDate } }
                    ]
                }
            },
            { $sort: { likesCounter: -1 } },
            { $limit: 100 },
            {
                $project: {
                    _id: 0,
                    user_info: {
                        name: 1,
                        _id: 1
                    },
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

export async function statMatches(req,res){
    try {
        const gender = req.params.gender;
        const minAge = parseInt(req.query.minAge) || 18;
        const maxAge = parseInt(req.query.maxAge) || 100;

        const today = new Date();
        const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - minAge - 1, today.getMonth(), today.getDate());

        const ranking = await Match.aggregate([
            {
                $project: {
                    participants: ["$user_A", "$user_B"]
                }
            },
            { $unwind: "$participants" },
            {
                $group: {
                    _id: '$participants',
                    matchesCounter: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "userdatas",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_info"
                }
            },
            { $unwind: "$user_info" },
            {
                $match: {
                    $and: [
                        ...(gender !== 'all' ? [{ "user_info.gender": gender }] : []),
                        { "user_info.date_of_birth": { $gte: minDate, $lte: maxDate } }
                    ]
                }
            },
            { $sort: { matchesCounter: -1 } },
            { $limit: 100 },
            {
                $project: {
                    _id: 0,
                    user_info: {
                        name: 1,
                        _id: 1,
                        age: 1, 
                        gender: 1
                    },
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