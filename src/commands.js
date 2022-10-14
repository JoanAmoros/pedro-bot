const { client_id, tankIcon, healerIcon, dpsIcon } = require('./config.json')

const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js')

async function fetchRaid(db, id) {
  const raid = await db.get(`SELECT * FROM raids WHERE message_id = :id`, prepareFields({id}))
  raid.users = await db.all(`
    SELECT u.id as id, u.discord_id as discord_id, u.discord_user as discord_user, u.name as name, ru.role as role FROM raid_user as ru
    INNER JOIN users as u ON u.id = ru.user_id
    WHERE ru.raid_id = :id
  `, prepareFields({ id: raid.id }))
  return raid
}

function prepareFields(fields) {
  let newFields = {}
  Object.keys(fields).forEach(key => newFields[`:${key}`] = fields[key])
  return newFields
}

function buildColumn (users) {
  if (users.length === 0)
    return 'N/A'

  return users.map(u => u.name).join('\n')
}

function buildEmbed(user, raid) {
  const maxTanks = 2
  const maxHealers = raid.players === 10 ? 2 : 5
  const maxDps = raid.players === 10 ? 6 : 18

  const tanks = raid.users.filter(u => u.role === 'tank')
  const healers = raid.users.filter(u => u.role === 'healer')
  const dps = raid.users.filter(u => u.role === 'dps')

  return new EmbedBuilder()
    .setColor(raid.heroic ? 0xffd700 : 0x0dcaf0)
    .setTitle(raid.name)
    .setDescription(`Raid de ${raid.players} personas.${raid.heroic ? ' Heroica.' : ''}`)
    .addFields({
      name: 'Fecha',
      value: `<t:${raid.ts / 1000}:R>`
    })
    .addFields(
      {
        name: `<:tank:${tankIcon}> Tanques (${tanks.length}/${maxTanks})`,
        value: buildColumn(tanks),
        inline: true
      },
      {
        name: `<:healer:${healerIcon}> Healers (${healers.length}/${maxHealers})`,
        value: buildColumn(healers),
        inline: true
      },
      {
        name: `<:dps:${dpsIcon}> DPS (${dps.length}/${maxDps})`,
        value: buildColumn(dps),
        inline: true
      },
    )
    .setFooter({
      text: user.username,
      iconURL: user.displayAvatarURL()
    })
}

function buildButtons(users) {
  const row = new ActionRowBuilder()
  users.forEach(u => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${u.id}`)
        .setLabel(u.name)
        .setStyle(ButtonStyle.Primary)
    )
  })
  return row
}

function buildSelectMenu(raid) {
  const menu = new SelectMenuBuilder()
  menu.setCustomId(`${raid.id}`)
  menu.setPlaceholder('Selecciona a tu víctima')
  raid.users.forEach(u => {
    menu.addOptions({
      label: u.name,
      description: u.discord_user,
      value: `${u.id}`
    })
  })
  return (new ActionRowBuilder()).setComponents(menu)
}

function userHasReaction (user, reaction) {
  return reaction.message.reactions.cache
    .filter(r =>
      r.emoji.id !== reaction.emoji.id && r.users.cache.has(user.id)
    ).size > 0
}

async function handleDestruction (db, reaction, user) {
  const { message } = reaction
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch()
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error)
      // Return as `reaction.message.author` may be undefined/null
      return
    }
  }

  if (user.id === client_id || message.author.id !== client_id)
    return

  let raid = await fetchRaid(db, message.id)

  if (raid.creator_id !== user.id) {
    return await reaction.users.remove(user)
  }

  const question = await message.reply({components: [buildSelectMenu(raid)], ephemeral: true, fetchReply: true})
  const answer = await question.awaitMessageComponent({ componentType: ComponentType.SelectMenu, time: 15000 })
  if (answer.user.id !== user.id || answer.customId != raid.id) {
    await question.delete()
    return await reaction.users.remove(user)
  }

  console.log(answer.values)
  db.run(`DELETE FROM raid_user WHERE raid_id = :raid AND user_id = :user`, prepareFields({
    raid: raid.id,
    user: parseInt(answer.values[0])
  }))

  raid.users = raid.users.filter(u => u.id != answer.values[0])

  const embed = buildEmbed(user, raid)

  await message.edit({ embeds: [embed] })

  await question.delete()
  await reaction.users.remove(user)
}

async function updateRaid(db, reaction, user) {
  const { message } = reaction
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch()
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error)
      // Return as `reaction.message.author` may be undefined/null
      return
    }
  }

  if (user.id === client_id || message.author.id !== client_id)
    return

  let raid = await fetchRaid(db, message.id)

  const discordUser = message.guild.members.cache.find(u => u.id === raid.creator_id).user

  const embed = buildEmbed(discordUser, raid)

  await message.edit({ embeds: [embed] })

  await reaction.users.remove(user)
}

async function modifyRaid(db, reaction, user, add) {
  const { message } = reaction
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch()
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error)
      // Return as `reaction.message.author` may be undefined/null
      return
    }
  }

  if (user.id === client_id || message.author.id !== client_id)
    return

  let raid = await fetchRaid(db, message.id)

  let type
  switch (reaction.emoji.id) {
    case tankIcon:
      type = 'tank'
      break
    case healerIcon:
      type = 'healer'
      break
    case dpsIcon:
      type = 'dps'
      break
    default:
      return await reaction.users.remove(user)
  }

  const max = {
    tank: 2,
    healer: raid.players === 10 ? 2 : 5,
    dps: raid.players === 10 ? 6 : 18
  }

  if (
    // User has already reacted
    add && userHasReaction(user, reaction)
    // Role is filled
   || raid.users.filter(u => u.role === type).length >= max[type]
    // User has already joined to this raid
   || raid.users.some(u => u.discord_id === user.id)
  ) {
    await reaction.users.remove(user)
    return
  }

  if (add) {
    const raidUsers = await db.all(`SELECT * FROM users WHERE discord_user = :user`, prepareFields({
      user: user.tag
    }))
    let raidUser
    if (raidUsers.length === 1) {
      raidUser = raidUsers[0]
    } else {
      const question = await message.reply({components: [buildButtons(raidUsers)], ephemeral: true, fetchReply: true})
      const answer = await question.awaitMessageComponent({ componentType: ComponentType.Button, time: 10000 })
      if (answer.user.id !== user.id) {
        await question.delete()
        return await reaction.users.remove(user)
      }
      raidUser = raidUsers.find(u => u.id == answer.customId)
      await question.delete()
    }
    db.run(`INSERT INTO raid_user (user_id, raid_id, role) VALUES (:user, :raid, :role)`, prepareFields({
      raid: raid.id,
      user: raidUser.id,
      role: type
    }))
    raid.users.push({
      id: raidUser.id,
      discord_user: raidUser.discord_user,
      name: raidUser.name,
      role: type
    })
  } else {
    const raidUser = raid.users.find(u => u.discord_user === user.tag)
    if (raidUser === undefined || raidUser.role !== type) {
      return await reaction.users.remove(user)
    }
    db.run(`DELETE FROM raid_user WHERE raid_id = :raid AND user_id = :user`, prepareFields({
      raid: raid.id,
      user: raidUser.id
    }))
    raid.users = raid.users.filter(u => u.id !== raidUser.id)
  }

  const discordUser = message.guild.members.cache.find(u => u.id === raid.creator_id).user

  const embed = buildEmbed(discordUser, raid)

  await message.edit({ embeds: [embed] })
}

module.exports = {
  async reactionAdded (db, reaction, user) {
    if (reaction.emoji.name === '❌') {
      return await handleDestruction(db, reaction, user)
    } else if (reaction.emoji.name === '🔄') {
      return await updateRaid(db, reaction, user)
    }
    await modifyRaid(db, reaction, user, true)
  },
  async reactionRemoved (db, reaction, user) {
    await modifyRaid(db, reaction, user, false)
  },
  async iam (db, interaction) {
    await interaction.deferReply({ ephemeral: true })
    const name = interaction.options.getString('character')
    const users = await db.all(`SELECT * FROM users WHERE name = :name AND discord_id = :id`, prepareFields({
      id: interaction.user.id,
      name: name
    }))
    if (users.length > 0) {
      return await interaction.editReply(`El personaje ${name} ya existe`)
    }
    db.run(`INSERT INTO users (discord_id, discord_user, name, class) VALUES (:id, :user, :name, :class)`, {
      ':id': interaction.user.id,
      ':user': interaction.user.tag,
      ':name': name,
      ':class': interaction.options.getString('class')
    })
      .then(() => {
        interaction.editReply(`Tu personaje ${name} ha sido guardado`)
      })
  },
  async remove (db, interaction) {
    await interaction.deferReply({ ephemeral: true })
    const name = interaction.options.getString('character')
    const users = await db.all(`SELECT * FROM users WHERE name = :name`, prepareFields({
      name
    }))
    if (users.length === 0)
      return await interaction.editReply(`El personaje ${name} no existe`)
    else if (users[0].discord_id !== interaction.user.id)
      return await interaction.editReply(`El personaje ${name} no te pertenece`)


    db.run(`DELETE FROM users WHERE id = :id`, prepareFields({
      id: users[0].id
    }))
    db.run(`DELETE FROM raid_user WHERE user_id = :id`, prepareFields({
      id: users[0].id
    }))
    await interaction.editReply(`El personaje ${name} ha sido eliminado`)
  },
  async raid (db, interaction) {
    const day = interaction.options.getString('date')
    const time = interaction.options.getString('time')
    const name = interaction.options.getString('name')
    const players = interaction.options.getInteger('players')
    const heroic = interaction.options.getBoolean('heroic') ?? false
    const parts = day.match(/(\d+)/g)
    const date = new Date(parts[2], parts[1] - 1, parts[0], time.split(':')[0], time.split(':')[1])
    const ts = date.getTime()

    const raid = { name, players, ts, heroic, users: [] }
    const embed = buildEmbed(interaction.user, raid)
    const reply = await interaction.reply({ embeds: [embed], fetchReply: true })

    db.run(
      `INSERT INTO raids (creator_id, message_id, name, players, ts, heroic) VALUES (:creator, :id, :name, :players, :ts, :heroic)`,
      prepareFields({ creator: interaction.user.id, id: reply.id, name, players, ts, heroic })
    )

    await reply.react(tankIcon)
    await reply.react(healerIcon)
    await reply.react(dpsIcon)
    await reply.react('❌')
    await reply.react('🔄')
  },
  async invite (db, interaction) {
    interaction.reply(`https://discord.com/api/oauth2/authorize?client_id=${client_id}&permissions=8&scope=bot%20applications.commands`)
  }
}