import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const JWT_SECRET = "bardzosekretnysekret";

let users = []
let userCredentials = [
    {userId: 1, email: "ala@gmail.com", passwordHash: "aaaaaaa", isAdmin: false},
    {userId: 2, email: "pawel@gmail.com", passwordHash: "bbbbbbb", isAdmin: false},
    {userId: 3, email: "asia@gmail.com", passwordHash: "ccccccc", isAdmin: false},
    {userId: 4, email: "michal@gmail.com", passwordHash: "ddddddd", isAdmin: true}
]
let currentId = Math.max(...users.map(u => u.id));

//Funkcja do rejestracji użytkownika
export async function register(req, res) {

    const result = credentialsSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({success: false, error: z.flattenError(result.error)});
    }

    const {email, password} = result.data;

    const user = await UserCredentials.findOne({ email: email });
    
      if (user !== null) {
        return res.status(409).json({ success: false, error: "User with such email already exists" });
      }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUserCredential = {
        email: email,
        password_hash: passwordHash,
        role: "User"
    }

    try {
        const result = await UserCredentials.insertOne(newUserCredential);
      }
      catch (err) {
        console.error(`An error occured while trying to insert new UserData object: ${err}`);
        return res.status(500).json({ success: false, error: "A database error has occured" });
      }
    
      const newUser = await UserCredentials.findOne({email: email});

    res.status(201).json({success: true, user_id: newUser._id});
}

// funkcja do logowania użytkownika
export async function login(req, res) {

    const result = credentialsSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({success: false, error: z.flattenError(result.error)});
    }

    const {email, password} = result.data;

    const user = await UserCredentials.findOne({ email: email });
    
    if (!user) {
        return res.status(401).json({ success: false, error: "Invalid email or password"});
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid){
        return res.status(401).json({success: false, error: "Invalid email or password"})
    }

    const token = jwt.sign(
        {userId: user._id, email: user.email, role: user.role},
        JWT_SECRET,
        {expiresIn: "1h"}
    )
    return res.status(200).json({token});
    
}

