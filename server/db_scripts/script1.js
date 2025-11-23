import mongoose from "mongoose";
import { Match } from "../models/Match.js";
import { Message } from "../models/Message.js";

await mongoose.connect("mongodb://localhost:27017/JSDB");
console.log("Connected to DB");

// USERS FROM YOUR MESSAGE
const users = [
  { name: "Kasia", id: "69235e7c34b266841e2a40a2" },
  { name: "Karol", id: "69235fa08aa426a47c2eb92f" },
  { name: "Krzysiek", id: "69235fad8aa426a47c2eb933" },
  { name: "Kinga", id: "69235fb98aa426a47c2eb937" },
  { name: "Krystian", id: "69235fc58aa426a47c2eb93b" },
  { name: "Karolina", id: "69235fd18aa426a47c2eb93f" },
  { name: "Kamil", id: "69235fdc8aa426a47c2eb943" },
  { name: "Kjoanna", id: "69235fe88aa426a47c2eb947" }
];

const userIds = users.map(u => u.id);

const uniqueMatchPairs = new Set();
const matchesToCreate = 16; // ile matchy wygenerować

function pairKey(a, b) {
  return [a, b].sort().join("-");
}

// --------------- CREATE MATCHES -----------------

console.log("\nCreating matches...\n");

const createdMatches = [];

for (let i = 0; i < matchesToCreate; i++) {
  let u1, u2, key;

  do {
    u1 = userIds[Math.floor(Math.random() * userIds.length)];
    u2 = userIds[Math.floor(Math.random() * userIds.length)];
    key = pairKey(u1, u2);
  } while (u1 === u2 || uniqueMatchPairs.has(key));

  uniqueMatchPairs.add(key);

  const match = await Match.create({
    user_A: u1,
    user_B: u2
  });

  console.log(`Match created: ${u1} <-> ${u2}`);
  createdMatches.push(match);
}

console.log(`\nTotal matches created: ${createdMatches.length}\n`);


// --------------- CREATE MESSAGES -----------------

console.log("Creating messages...\n");

for (const match of createdMatches) {
  const msgsCount = Math.floor(Math.random() * 8); // 1–8 wiadomości
  const usersInMatch = [match.user_A.toString(), match.user_B.toString()];

  for (let i = 0; i < msgsCount; i++) {
    const from = usersInMatch[i % 2];
    const to = usersInMatch[(i + 1) % 2];

    const randomDate = new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 30);

    await Message.create({
      match_id: match._id,
      from_user: from,
      to_user: to,
      content: `Test message ${i + 1} for match ${match._id}`,
      created_at: randomDate
    });
  }

  console.log(`Added ${msgsCount} msgs to match ${match._id}`);
}

console.log("\nMessages generation completed.");
await mongoose.disconnect();
