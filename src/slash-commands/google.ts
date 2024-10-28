import {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from 'discord.js';
import { SlashCommand } from '../types';

const GOOGLE_URL = 'https://google.com';

export const GoogleCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('google')
    .setDescription('Returns a link to Google'),
  async run(interaction) {
    const linkButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setURL(GOOGLE_URL)
        .setStyle(ButtonStyle.Link)
        .setLabel('visit Google')
    );
    await interaction.reply({
      components: [linkButton],
    });
  },
};
