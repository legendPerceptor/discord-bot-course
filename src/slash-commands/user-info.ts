import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { EmbedBuilder } from '@discordjs/builders';

export const UserInfoCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user which we will know about')
        .setRequired(true)
    )
    .setName('user_info')
    .setDescription('Returns the info of a user'),
  async run(interaction) {
    if (interaction.isChatInputCommand()) {
      const user = interaction.options.getUser('user', true);
      const avatar = user.displayAvatarURL();
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(user.tag)
        .setThumbnail(avatar)
        .addFields({
          name: 'Registered on',
          value: user.createdAt.toDateString(),
          inline: true,
        })
        .setFooter({ text: `ID: ${user.id}` });

      await interaction.reply({
        embeds: [embed],
      });
    }
  },
};
