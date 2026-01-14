export default function authAdmin(req, res,next){
    if(!req.user){
        return res.status(401).JSON({error: "Not authenticated"});
    }
    if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  next();
}