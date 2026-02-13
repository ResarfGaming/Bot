const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load JSON files or initialize empty arrays
let transactions = fs.existsSync('transactions.json') ? JSON.parse(fs.readFileSync('transactions.json')) : [];
let ids = fs.existsSync('ids.json') ? JSON.parse(fs.readFileSync('ids.json')) : [];

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('transactionadd')
    .setDescription('Add a transaction')
    .addStringOption(opt => opt.setName('account').setDescription('Account number').setRequired(true))
    .addStringOption(opt => opt.setName('type').setDescription('DEPOSIT/WITHDRAW/BALANCE').setRequired(true)
      .addChoices(
        { name: 'DEPOSIT', value: 'DEPOSIT' },
        { name: 'WITHDRAW', value: 'WITHDRAW' },
        { name: 'BALANCE', value: 'BALANCE' },
      ))
    .addStringOption(opt => opt.setName('item').setDescription('Item/Amount').setRequired(true)),

  new SlashCommandBuilder().setName('export').setDescription('Export transactions log'),

  new SlashCommandBuilder()
    .setName('idcheck')
    .setDescription('Check an ID status')
    .addStringOption(opt => opt.setName('code').setDescription('ID code (XXX-XXX)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('addid')
    .setDescription('Add a new ID (Admin only)')
    .addStringOption(opt => opt.setName('name').setDescription('Full Name').setRequired(true))
    .addStringOption(opt => opt.setName('username').setDescription('Username').setRequired(true))
    .addIntegerOption(opt => opt.setName('age').setDescription('Age').setRequired(true))
    .addStringOption(opt => opt.setName('expires').setDescription('Expiration (DD/MM/YYYY)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('revokeid')
    .setDescription('Revoke an ID (Admin only)')
    .addStringOption(opt => opt.setName('code').setDescription('ID code').setRequired(true)),

  new SlashCommandBuilder()
    .setName('idedit')
    .setDescription('Edit an ID (Admin only)')
    .addStringOption(opt => opt.setName('code').setDescription('ID code').setRequired(true))
    .addStringOption(opt => opt.setName('username').setDescription('Username').setRequired(true))
    .addStringOption(opt => opt.setName('name').setDescription('Full Name').setRequired(true))
    .addIntegerOption(opt => opt.setName('age').setDescription('Age').setRequired(true))
    .addStringOption(opt => opt.setName('expires').setDescription('Expiration (DD/MM/YYYY)').setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('Registering commands...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Commands registered!');
  } catch (err) {
    console.error(err);
  }
})();

// --- Bot logic ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const admin = interaction.memberPermissions?.has('Administrator');

  if (interaction.commandName === 'transactionadd') {
    const account = interaction.options.getString('account');
    const type = interaction.options.getString('type');
    const item = interaction.options.getString('item');

    const tx = {
      account,
      type,
      item,
      transactionId: uuidv4().slice(0,15).toUpperCase(),
      timestamp: new Date().toISOString()
    };

    transactions.push(tx);
    fs.writeFileSync('transactions.json', JSON.stringify(transactions, null, 2));
    await interaction.reply(`Transaction added! ID: **${tx.transactionId}**`);
  }

  else if (interaction.commandName === 'export') {
    await interaction.reply({ content: 'Transactions log:', files: ['transactions.json'] });
  }

  else if (interaction.commandName === 'idcheck') {
    const code = interaction.options.getString('code');
    const id = ids.find(i => i.code === code);
    if (!id) return interaction.reply('Not Found');

    const expired = new Date(id.expires.split('/').reverse().join('-')) < new Date();
    if (expired) id.status = 'EXPIRED';

    const statusText = id.status === 'EXPIRED' || id.status === 'REVOKED' 
      ? `**${id.status}**` 
      : id.status || 'VALID';

    await interaction.reply(
      `Code: ${code}\nUser: ${id.username}\nName: ${id.name}\nAge: ${id.age}\nExpires: ${id.expires}\nStatus: ${statusText}`
    );
  }

  else if (interaction.commandName === 'addid') {
    if (!admin) return interaction.reply('You must be an admin!');
    const name = interaction.options.getString('name');
    const username = interaction.options.getString('username');
    const age = interaction.options.getInteger('age');
    const expires = interaction.options.getString('expires');

    const code = `${Math.random().toString(36).substring(2,5).toUpperCase()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`;
    const newId = { code, username, name, age, expires, status: 'VALID' };
    ids.push(newId);
    fs.writeFileSync('ids.json', JSON.stringify(ids, null, 2));

    await interaction.reply(`ID added: ${code}`);
  }

  else if (interaction.commandName === 'revokeid') {
    if (!admin) return interaction.reply('Admin only!');
    const code = interaction.options.getString('code');
    const id = ids.find(i => i.code === code);
    if (!id) return interaction.reply('ID not found');
    id.status = 'REVOKED';
    fs.writeFileSync('ids.json', JSON.stringify(ids, null, 2));
    await interaction.reply(`ID ${code} revoked`);
  }

  else if (interaction.commandName === 'idedit') {
    if (!admin) return interaction.reply('Admin only!');
    const code = interaction.options.getString('code');
    const id = ids.find(i => i.code === code);
    if (!id) return interaction.reply('ID not found');

    id.username = interaction.options.getString('username');
    id.name = interaction.options.getString('name');
    id.age = interaction.options.getInteger('age');
    id.expires = interaction.options.getString('expires');

    fs.writeFileSync('ids.json', JSON.stringify(ids, null, 2));
    await interaction.reply(`ID ${code} updated`);
  }
});

client.login(TOKEN);
