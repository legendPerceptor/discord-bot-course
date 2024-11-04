import {
  SlashCommandBuilder,
  EmbedBuilder,
  userMention,
  roleMention,
} from 'discord.js';
import { SlashCommand } from '../types';

const UserInfoCommand: SlashCommand = {
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
    const getFormattedDate = (date: Date) => {
      return date.toLocaleDateString(interaction.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    if (interaction.isChatInputCommand()) {
      const user = interaction.options.getUser('user', true);
      const avatar = user.displayAvatarURL();
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(user.tag)
        .setThumbnail(avatar)
        .addFields({
          name: 'Registered on',
          value: getFormattedDate(user.createdAt),
          inline: true,
        })
        .setFooter({ text: `ID: ${user.id}` });

      if (interaction.inGuild()) {
        const guild =
          interaction.guild ||
          (await interaction.client.guilds.fetch(interaction.guildId));
        const member =
          guild.members.cache.get(user.id) ||
          (await guild.members.fetch(user.id));
        const jointedAt = member.joinedAt;

        embed.setDescription(userMention(user.id));
        if (jointedAt) {
          embed.addFields({
            name: 'Joined at',
            value: getFormattedDate(jointedAt),
          });
        }
        const roles = member.roles.cache;
        const filteredRoles = roles
          .filter((role) => role.name != '@everyone')
          .map((role) => roleMention(role.id));
        if (filteredRoles.length > 0) {
          embed.addFields({
            name: `Roles [${filteredRoles.length}]`,
            value: filteredRoles.join(' '),
          });
        }
      }
      await interaction.reply({
        embeds: [embed],
      });
    }
  },
};

export { UserInfoCommand };
