import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
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

function logAction(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  return fs.appendFile('bot.log', line).catch(() => {});
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel],
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

const setupCommand = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Link this Discord server with Whop')
  .addStringOption(opt =>
    opt.setName('code').setDescription('Setup code from dashboard').setRequired(true)
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

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'setup') return;
  const codeArg = interaction.options.getString('code');

  if (!codeArg) {
    await interaction.reply({ content: 'Provide the setup code from your dashboard.', ephemeral: true });
    return;
  }

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: 'This command must be used in a server.', ephemeral: true });
    return;
  }

  let conn;
  try {
    conn = await mysql.createConnection(DB_CONFIG);
    const [[row]] = await conn.execute(
      'SELECT whop_id FROM discord_setup_codes WHERE code=? LIMIT 1',
      [codeArg]
    );
    if (!row) {
      await interaction.reply({ content: 'Invalid setup code.', ephemeral: true });
      await conn.end();
      return;
    }
    const whopId = row.whop_id;
    await conn.execute(
      'REPLACE INTO discord_servers (whop_id, guild_id, owner_discord_id) VALUES (?, ?, ?)',
      [whopId, guildId, interaction.user.id]
    );
    await conn.execute('DELETE FROM discord_setup_codes WHERE code=?', [codeArg]);
    await conn.end();
    await interaction.reply({ content: 'Server linked successfully!', ephemeral: true });
  } catch (err) {
    console.error('DB error', err);
    if (conn) await conn.end();
    await interaction.reply({ content: 'Database error.', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

registerCommands()
  .then(() => client.login(TOKEN))
  .catch(console.error);

// Periodic membership check every 5 minutes
setInterval(async () => {
  let conn;
  try {
    conn = await mysql.createConnection(DB_CONFIG);
    for (const guild of client.guilds.cache.values()) {
      const [[srvRow]] = await conn.execute(
        'SELECT whop_id, expire_action, expire_role_id FROM discord_servers WHERE guild_id=? LIMIT 1',
        [guild.id]
      );
      const whopId = srvRow ? srvRow.whop_id : null;
      const expireAction = srvRow ? srvRow.expire_action : 'kick';
      const expireRoleId = srvRow ? srvRow.expire_role_id : null;
      if (!whopId) continue;

      const members = await guild.members.fetch().catch(() => null);
      if (!members) continue;
      for (const member of members.values()) {
        if (member.user.bot) continue;

        const [[accRow]] = await conn.execute(
          "SELECT user_id FROM linked_accounts WHERE platform='discord' AND account_url=? LIMIT 1",
          [`https://discord.com/users/${member.id}`]
        );

        let hasSub = false;
        if (accRow && accRow.user_id) {
          const [[paidRow]] = await conn.execute(
            "SELECT id FROM memberships WHERE user_id=? AND whop_id=? AND status='active' LIMIT 1",
            [accRow.user_id, whopId]
          );
          const [[freeRow]] = await conn.execute(
            'SELECT id FROM whop_members WHERE user_id=? AND whop_id=? LIMIT 1',
            [accRow.user_id, whopId]
          );
          hasSub = Boolean(paidRow || freeRow);
        }

        logAction(
          `User ${member.id} in ${guild.id} subscription ${hasSub ? 'active' : 'inactive'}`
        );

        if (!hasSub) {
          if (expireAction === 'remove_role' && expireRoleId) {
            await member.roles
              .remove(expireRoleId)
              .catch(() => null);
          } else if (expireAction === 'remove_all') {
            await member.roles
              .set([])
              .catch(() => null);
          } else {
            await member.kick('Inactive membership').catch(() => null);
            logAction(`Kicked ${member.id} from ${guild.id}`);
          }

          await conn
            .execute('DELETE FROM discord_members WHERE guild_id=? AND discord_id=?', [
              guild.id,
              member.id,
            ])
            .catch(() => null);
        }
      }
    }
  } catch (err) {
    console.error('Periodic check failed', err);
    logAction(`Error during check: ${err.message}`);
  } finally {
    if (conn) await conn.end();
  }
}, 5 * 60 * 1000);
