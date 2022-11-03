const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');
const { urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "bJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if the email does not exist', () => {
    const user = getUserByEmail("nonexist@example.com", testUsers);
    assert.equal(user, undefined);
  });
});

describe('urlsForUser', () => {
  it('should return user if email exists', () => {
    const user = urlsForUser('aJ48lW', testUrlDatabase);
    const expectedUser = {i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW",
    }};
    assert.deepEqual(user, expectedUser);
  });

  it('should return an empty object if email does not exist', () => {
    const user = urlsForUser('cJ48lW', testUrlDatabase);
    assert.deepEqual(user, {});
  });
});