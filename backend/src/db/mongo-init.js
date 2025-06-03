db.createUser({
  user: "mongo",
  pwd: "mongo",
  roles: [
    {
      role: "dbOwner",
      db: "visit-this-please",
    },
  ],
});

db.createCollection("Users");
db.createCollection("Places");
