const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

module.exports = async function () {
  const db = await open({
    filename: './src/db/main.db',
    driver: sqlite3.Database
  })

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id VARCHAR(191) NOT NULL,
        discord_user VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        class VARCHAR(191) NOT NULL
    )
  `)

  await db.run(`
    CREATE TABLE IF NOT EXISTS raids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id VARCHAR(191) NOT NULL,
        message_id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        players INTEGER NOT NULL,
        ts TIMESTAMP NOT NULL,
        heroic BOOLEAN NOT NULL DEFAULT FALSE
    )
  `)

  await db.run(`
    CREATE TABLE IF NOT EXISTS raid_user (
        user_id INTEGER NOT NULL,
        raid_id INTEGER NOT NULL,
        role VARCHAR(191) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  return db
}