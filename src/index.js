const openDb = require('./db')
const { REST, Routes, Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js')
const slashCommands = require('./slash-commands.js')
const commands = require('./commands.js')
const { token, client_id } = require('./config.json')

let db

openDb().then(database => db = database)

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationCommands(client_id), { body: slashCommands })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()

const client = new Client(
  {
    intents:
      [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
      ]
  },
  {
    partials:
      [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
      ]
  }
)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case 'iam':
        await commands.iam(db, interaction)
        break
      case 'remove':
        await commands.remove(db, interaction)
        break
      case 'raid':
        await commands.raid(db, interaction)
        break
      case 'invite':
        await commands.invite(db, interaction)
        break
      default:
        await interaction.reply('El comando no existe')
    }
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  await commands.reactionAdded(db, reaction, user)
})

client.on('messageReactionRemove', async (reaction, user) => {
  await commands.reactionRemoved(db, reaction, user)
})

client.login(token)
