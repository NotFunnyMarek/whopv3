import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dbadmin',
  password: process.env.DB_PASS || '3otwj3zR6EI',
  database: process.env.DB_NAME || 'byx',
  charset: 'utf8mb4',
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel],
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

const setupCommand = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Link this Discord server with Whop')
  .addStringOption(opt =>
    opt.setName('code').setDescription('6 digit code').setRequired(false)
  );

async function registerCommands() {
  const commands = [setupCommand.toJSON()];
  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  } else {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  }
  console.log('Commands registered');
}

const pendingCodes = new Map(); // userId -> code

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'setup') return;
  const codeArg = interaction.options.getString('code');

  if (!codeArg) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingCodes.set(interaction.user.id, code);
    try {
      await interaction.user.send(`Your verification code: **${code}**`);
      await interaction.reply({ content: 'Check your DMs and run /setup again with the code.', ephemeral: true });
    } catch (e) {
      await interaction.reply({ content: 'I cannot DM you. Please enable DMs and try again.', ephemeral: true });
    }
    return;
  }

  const expected = pendingCodes.get(interaction.user.id);
  if (!expected || expected !== codeArg) {
    await interaction.reply({ content: 'Invalid or expired code.', ephemeral: true });
    return;
  }

  pendingCodes.delete(interaction.user.id);

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: 'This command must be used in a server.', ephemeral: true });
    return;
  }

  try {
    const conn = await mysql.createConnection(DB_CONFIG);
    await conn.execute(
      'REPLACE INTO discord_servers (guild_id, owner_discord_id) VALUES (?, ?)',
      [guildId, interaction.user.id]
    );
    await conn.end();
    await interaction.reply({ content: 'Server linked successfully!', ephemeral: true });
  } catch (err) {
    console.error('DB error', err);
    await interaction.reply({ content: 'Database error.', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

registerCommands()
  .then(() => client.login(TOKEN))
  .catch(console.error);

// Periodic membership check every 12 hours
setInterval(async () => {
  let conn;
  try {
    conn = await mysql.createConnection(DB_CONFIG);
    const [rows] = await conn.execute('SELECT guild_id, discord_id FROM discord_members');
    for (const row of rows) {
      const guild = await client.guilds.fetch(row.guild_id).catch(() => null);
      if (!guild) continue;
      const member = await guild.members.fetch(row.discord_id).catch(() => null);
      if (!member) continue;
      const [[statusRow]] = await conn.execute(
        'SELECT active FROM whop_members WHERE discord_id=?',
        [row.discord_id]
      );
      if (!statusRow || !statusRow.active) {
        await member.kick('Inactive membership').catch(() => null);
      }
    }
  } catch (err) {
    console.error('Periodic check failed', err);
  } finally {
    if (conn) await conn.end();
  }
}, 12 * 60 * 60 * 1000);
