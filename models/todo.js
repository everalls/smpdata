const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

// Init db
db.serialize(() => {
  const sql =
    'CREATE TABLE IF NOT EXISTS todos (id integer primary key, title)';
  db.run(sql);
  db.run('INSERT INTO todos(title) VALUES(?)', 'buy the milk');
  db.run('INSERT INTO todos(title) VALUES(?)', 'rent a car');
  db.run('INSERT INTO todos(title) VALUES(?)', 'feed the cat');
});

class Todo {
  constructor(id, title) {
    this.id = id;
    this.title = title;
  }

  static all(callback) {
    db.all('SELECT * FROM todos', callback);
  }

  static add(todo) {
    const sql = 'INSERT INTO todos(title) VALUES(?)';
    db.run(sql, todo.title);
  }

  static update(todo, callback) {
    console.log('todo : ', todo);
    const sql = 'UPDATE todos SET title = ? WHERE id = ?';
    db.run(sql, todo.title, todo.id, callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM todos where id = ?';
    db.run(sql, id, callback);
  }
}

module.exports = Todo;
