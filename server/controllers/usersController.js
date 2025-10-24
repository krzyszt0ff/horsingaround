let users = [
  {id:1, name: "Ala", age:22, bio: "Jestem Ala. Lubię konie"},
  {id:2, name: "Paweł", age:28, bio: "Chcesz pojeździć na moim koniu?"},
  {id:3, name: "Asia", age:21, bio: "Lubię błyszczyki"},
  {id:4, name: "Michał", age: 22, bio: "Za pierwszą wypłatę zarobioną po politechnice kupię hobby horse'a"}
];
let currentId = Math.max(...users.map(u => u.id));

export function listUsers(req, res){
     res.json(users);
}

export function addUser(req, res) {
    const newPerson = {
    id: ++currentId,
    name: req.body.name,
    age: req.body.age,
    bio: req.body.bio
  };
  users.push(newPerson);
  res.status(201).json(newPerson);
};

export function updateUser(req,res){
    const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id===id);
  if (idx===-1){
    return res.status(404).json({error: "User not found"});
  } 

  users[idx] = {
    id,
    name: req.body.name,
    age: req.body.age,
    bio: req.body.bio
  }
  res.json(users[idx]);
}

export function deleteUser(req, res) {
    const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id===id);
  if (idx===-1){
    return res.status(404).json({error: "User not found"});
  }

  users.splice(idx,1);
  res.status(204).send();
}