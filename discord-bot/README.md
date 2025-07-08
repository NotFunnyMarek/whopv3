# Discord Access Bot

This bot links a Discord server with the Whop platform.

## Setup
1. Install dependencies:
```bash
npm install
```
2. Create a `.env` file with:
```
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=optional_guild_id
DB_HOST=localhost
DB_USER=dbadmin
DB_PASS=3otwj3zR6EI
DB_NAME=byx
WHOP_ID=1
```
`GUILD_ID` can be omitted to register slash commands globally.
`WHOP_ID` should match the ID of the Whop this server belongs to.
3. Run the bot:
```bash
node bot.js
```

The bot exposes a single `/setup` command. Use it without arguments to receive a six digit code in a DM. Run the command again with the code to link the server.
