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
```
`GUILD_ID` can be omitted to register slash commands globally.
3. Run the bot:
```bash
node bot.js
```

The bot exposes a single `/setup` command. Generate a setup code in your account dashboard and pass it as `/setup <code>` to link the server.
