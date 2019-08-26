 module.exports = {
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'dockerdb',
  database: 'meetapp',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
  },
 };