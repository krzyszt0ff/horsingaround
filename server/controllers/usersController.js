//To takie enumy
const genders = Object.freeze({
  male: "male",
  female: "female",
  other: "other"
});

const preferredGenders = Object.freeze({
  male: "male",
  female: "female",
  other: "other",
  maleAndFemale: "male_and_female",
  all: "all"
})

export let users = [
  {id:1, name: "Ala", age:22, bio: "Jestem Ala. Lubię konie", gender: genders.other, 
    preferred_gender: preferredGenders.all, location: [21.001, 53.001], preffered_distance: 20},
  {id:2, name: "Paweł", age:28, bio: "Chcesz pojeździć na moim koniu?", gender: genders.male, 
    preferred_gender: preferredGenders.female, location: [21.456, 53.123], preffered_distance: 10},
  {id:3, name: "Asia", age:21, bio: "Lubię błyszczyki", gender: genders.female, 
    preferred_gender: preferredGenders.male, location: [21.122, 53.087], preffered_distance: 50},
  {id:4, name: "Michał", age: 22, bio: "Za pierwszą wypłatę zarobioną po politechnice kupię hobby horse'a", gender: genders.male, 
    preferred_gender: preferredGenders.maleAndFemale, location: [21.056, 53.234], preffered_distance: 8}
];

let currentId = Math.max(...users.map(u => u.id));

//Pobieranie przefiltrowanych danych użytkowników, którym już można dać like'a
export function listUsers(req, res){
     res.json(users);
}

//Pobieranie danych innego użytkownika
export function showUser(req,res) {
  const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id === id);

  if (idx===-1){
    return res.status(404).json({error: "User not found"});
  }

  res.json(users[idx]);
}

export function showMyProfile(req, res)
{

}

//To funkcja do tworzenia danych profilu, nie rejestracji użytkownika!!!
//Rejestracja użytkownika odbywa się przez funkcję register pod adresem /api/auth/register, w authController.js i auth.js w routerach
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

//Aktualizacja danych w profilu zalogowanego użytkownika
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

//Usunięcie swojego profilu przez zalogowanego użytkownika/administratora
export function deleteUser(req, res) {
    const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id===id);
  if (idx===-1){
    return res.status(404).json({error: "User not found"});
  }

  users.splice(idx,1);
  res.status(204).send();
}