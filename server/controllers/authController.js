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
    //pola do przesłania w body requestu
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password){
        return res.status(400).json({error: "Required fields missing"});
    }

    if (userCredentials.findIndex(u => u.email === email)!=-1){
        return res.status(409).json({error: "User already exists"});
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUserCredential = {
        userId: ++currentId,
        email: email,
        passwordHash: passwordHash,
        isAdmin: false
    }

    userCredentials.push(newUserCredential);

    res.status(201).json({res: "User created"});
}

export async function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password){
        return res.status(400).json({error: "Required fields missing"});
    }

    const user = userCredentials.find(u => u.email===email);

    if (!user){
        return res.status(409).json({error: "Invalid email or password"});
    } 

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid){
        return res.status(401).json({message: "Invalid email or password"})
    }

    const token = jwt.sign(
        {id: user.userId, email: user.email, isAdmin: user.isAdmin},
        JWT_SECRET,
        {expiresIn: "1h"}
    )
    return res.status(200).json({token});
    
}

