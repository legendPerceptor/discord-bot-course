import { SlashCommandBuilder, userMention } from 'discord.js';
import { SlashCommand } from '../types';

export const HelloCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Returns a greeting'),
  async run(interaction) {
    await interaction.reply({
      content: `Hello ${userMention(interaction.user.id)}`,
    });
  },
};
