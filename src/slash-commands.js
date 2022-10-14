module.exports = [
  {
    name: 'invite',
    type: 1,
    description: 'Genera un enlace de invitación del bot',
  },
  {
    // iam NAME CLASS
    name: 'iam',
    type: 1,
    description: 'Asigna tu nombre y clase a tu usuario de discord',
    options: [
      {
        name: 'character',
        description: 'El nombre de tu personaje',
        type: 3,
        required: true
      },
      {
        name: 'class',
        description: 'La clase de tu personaje',
        type: 3,
        required: true,
        choices: [
          {
            name: 'Druid',
            value: 'druid'
          },
          {
            name: 'Hunter',
            value: 'hunter'
          },
          {
            name: 'Mage',
            value: 'mage'
          },
          {
            name: 'Paladin',
            value: 'paladin'
          },
          {
            name: 'Priest',
            value: 'priest'
          },
          {
            name: 'Rogue',
            value: 'rogue'
          },
          {
            name: 'Shaman',
            value: 'shaman'
          },
          {
            name: 'Warlock',
            value: 'warlock'
          },
          {
            name: 'Warrior',
            value: 'warrior'
          }
        ]
      }
    ]
  },
  {
    // remove NAME
    name: 'remove',
    type: 1,
    description: 'Desasigna el personaje de tu usuario de discord',
    options: [
      {
        name: 'character',
        description: 'El nombre de tu personaje',
        type: 3,
        required: true
      }
    ]
  },
  {
    // raid RAID PLAYERS DAY TIME
    name: 'raid',
    type: 1,
    description: 'Crea una nueva raid',
    options: [
      {
        name: 'name',
        description: 'El nombre de la raid',
        type: 3,
        required: true,
        choices: [
          {
            name: 'Naxxramas',
            value: 'Naxxramas'
          },
          {
            name: 'Sagrario Obsidiana',
            value: 'Sagrario Obsidiana'
          },
          {
            name: 'Sagrario Rubí',
            value: 'Sagrario Rubí'
          },
        ]
      },
      {
        name: 'players',
        description: 'El número de personas que participan en la raid',
        type: 4,
        required: true,
        choices: [
          {
            name: '10',
            value: 10
          },
          {
            name: '25',
            value: 25
          }
        ]
      },
      {
        name: 'date',
        description: 'El día que se realizará la raid',
        type: 3,
        required: true
      },
      {
        name: 'time',
        description: 'La hora que se realizará la raid',
        type: 3,
        required: true
      },
      {
        name: 'heroic',
        description: 'Si la raid es heroica o no',
        type: 5,
        required: false
      }
    ]
  }
]