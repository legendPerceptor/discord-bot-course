import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { onInteractionCreate, onMessageCreate, onReady } from './listeners';
import { TOKEN } from './config';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

onReady(client);
onMessageCreate(client);
onInteractionCreate(client);

client.login(TOKEN);
