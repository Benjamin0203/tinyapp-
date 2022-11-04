
//Function: generate random string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//Function: check if the user email exists in database(users), if it does, return the user object info, otherwise return undefined
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
}

//Function: returns the URLs where the userID is qual to the id of the currently logged-in user
const urlsForUser = (id, urlDatabase) => {
  let result = {};
  for (let el in urlDatabase) {
    if (urlDatabase[el].userID === id) {
      result[el] = urlDatabase[el];
    }
  }
  return result;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };