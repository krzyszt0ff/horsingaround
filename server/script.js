import mongoose from 'mongoose';
import { UserCredentials } from './models/UserCredentials.js';
import { UserData } from './models/UserData.js';
import { Match } from './models/Match.js';
import { Message } from './models/Message.js';

// Podłącz się do MongoDB
const MONGO_URI = "mongodb://localhost:27017/JSDB"; // zmień na swój URI
await mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

console.log("Connected to MongoDB");

// Funkcja seedująca
async function seed() {
  try {
    // 1️⃣ Pobierz użytkowników z bazy
    const users = await UserCredentials.find({});
    const userData = await UserData.find({});

    if (users.length === 0 || userData.length === 0) {
      console.log("Brak użytkowników lub userdata w bazie. Dodaj ich najpierw.");
      process.exit(1);
    }

    // 2️⃣ Przygotuj matchy
    const matches = [
      {
        _id: new mongoose.Types.ObjectId("694000000000000000000001"),
        user_A: users[0]._id,
        user_B: users[1]._id,
        created_at: new Date("2025-12-10T12:00:00.000Z")
      },
      {
        _id: new mongoose.Types.ObjectId("694000000000000000000002"),
        user_A: users[0]._id,
        user_B: users[2]._id,
        created_at: new Date("2025-12-11T15:00:00.000Z")
      },
      {
        _id: new mongoose.Types.ObjectId("694000000000000000000003"),
        user_A: users[3]._id,
        user_B: users[2]._id,
        created_at: new Date("2025-12-12T18:30:00.000Z")
      },
      {
        _id: new mongoose.Types.ObjectId("694000000000000000000004"),
        user_A: users[3]._id,
        user_B: users[1]._id,
        created_at: new Date("2025-12-13T12:00:00.000Z")
      },
      {
        _id: new mongoose.Types.ObjectId("694000000000000000000005"),
        user_A: users[0]._id,
        user_B: users[3]._id,
        created_at: new Date("2025-12-11T12:00:00.000Z")
      }
    ];

    await Match.insertMany(matches);
    console.log("Matches added.");

    // 3️⃣ Przygotuj wiadomości
    // 3️⃣ Przygotuj wiadomości
const messages = [
  // Match 1: users[0] i users[1]
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000001"),
    match_id: matches[0]._id,
    from_user: users[0]._id,
    to_user: users[1]._id,
    created_at: new Date("2025-12-10T12:10:00.000Z"),
    content: "Cześć! Jak się masz?",
    is_read: true
  },
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000002"),
    match_id: matches[0]._id,
    from_user: users[1]._id,
    to_user: users[0]._id,
    created_at: new Date("2025-12-10T12:15:00.000Z"),
    content: "Hej! Wszystko dobrze, a u Ciebie?",
    is_read: true
  },
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000006"),
    match_id: matches[0]._id,
    from_user: users[0]._id,
    to_user: users[1]._id,
    created_at: new Date("2025-12-10T12:20:00.000Z"),
    content: "U mnie też wszystko ok, dzięki!",
    is_read: true
  },

  // Match 2: users[0] i users[2]
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000003"),
    match_id: matches[1]._id,
    from_user: users[2]._id,
    to_user: users[0]._id,
    created_at: new Date("2025-12-11T15:30:00.000Z"),
    content: "Hej! Chcesz się spotkać w weekend?",
    is_read: false
  },
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000004"),
    match_id: matches[1]._id,
    from_user: users[0]._id,
    to_user: users[2]._id,
    created_at: new Date("2025-12-11T15:32:00.000Z"),
    content: "Jasne! Może w sobotę?",
    is_read: false
  },
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000007"),
    match_id: matches[1]._id,
    from_user: users[2]._id,
    to_user: users[0]._id,
    created_at: new Date("2025-12-11T15:35:00.000Z"),
    content: "Super, to do zobaczenia!",
    is_read: false
  },

  // Match 3: users[3] i users[2]
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000005"),
    match_id: matches[2]._id,
    from_user: users[3]._id,
    to_user: users[2]._id,
    created_at: new Date("2025-12-12T18:40:00.000Z"),
    content: "Cześć! Fajnie Cię poznać :)",
    is_read: false
  },
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000008"),
    match_id: matches[2]._id,
    from_user: users[2]._id,
    to_user: users[3]._id,
    created_at: new Date("2025-12-12T18:42:00.000Z"),
    content: "Cześć! Również miło :)",
    is_read: false
  },

  // Match 4: users[3] i users[1]
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000009"),
    match_id: matches[3]._id,
    from_user: users[3]._id,
    to_user: users[1]._id,
    created_at: new Date("2025-12-13T12:05:00.000Z"),
    content: "Hej, co słychać?",
    is_read: false
  },
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000010"),
    match_id: matches[3]._id,
    from_user: users[1]._id,
    to_user: users[3]._id,
    created_at: new Date("2025-12-13T12:10:00.000Z"),
    content: "Hej! Wszystko ok :)",
    is_read: false
  },

  // Match 5: users[0] i users[3]
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000011"),
    match_id: matches[4]._id,
    from_user: users[0]._id,
    to_user: users[3]._id,
    created_at: new Date("2025-12-11T12:10:00.000Z"),
    content: "Cześć! Masz dziś czas na rozmowę?",
    is_read: false
  },
  {
    _id: new mongoose.Types.ObjectId("695000000000000000000012"),
    match_id: matches[4]._id,
    from_user: users[3]._id,
    to_user: users[0]._id,
    created_at: new Date("2025-12-11T12:15:00.000Z"),
    content: "Cześć! Tak, mogę porozmawiać.",
    is_read: false
  }
];

    await Message.insertMany(messages);
    console.log("Messages added.");

    console.log("Seeding finished.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
}

seed();
