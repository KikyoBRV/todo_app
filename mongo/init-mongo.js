// Create database and sample user
db = db.getSiblingDB('todoapp');

db.createUser({
  user: 'todo_user',
  pwd: 'todo_password',
  roles: [{ role: 'readWrite', db: 'todoapp' }]
});

// Create sample collection
db.createCollection('todos');