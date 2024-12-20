import { ButtonStyle, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

const OPTIONS = Array.from({ length: EMOJIS.length }, (_, i) => ({
  name: `option${i + 1}`,
  description: `Poll option #${i + 1}`,
  required: i <= 1,
}));

enum TimeUnit {
  seconds = 'seconds',
  minutes = 'minutes',
  hours = 'hours',
}

const PollCommand: SlashCommand = {
  command: (() => {
    const slashCommand = new SlashCommandBuilder()
      .addIntegerOption((option) =>
        option
          .setName('time')
          .setDescription('How much time the poll is going to last')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(60)
      )
      .addStringOption((option) =>
        option
          .setName('time_unit')
          .setDescription('Time unit to be used')
          .setRequired(true)
          .addChoices([
            { name: 'Seconds', value: TimeUnit.seconds },
            { name: 'Minutes', value: TimeUnit.minutes },
            { name: 'Hours', value: TimeUnit.hours },
          ])
      )
      .setName('poll')
      .setDescription('Creates a poll');

    OPTIONS.forEach(({ name, description, required }) => {
      slashCommand.addStringOption((option) =>
        option.setName(name).setDescription(description).setRequired(required)
      );
    });

    slashCommand
      .addStringOption((option) =>
        option.setName('title').setDescription('The title of the poll')
      )
      .addStringOption((option) =>
        option
          .setName('description')
          .setDescription('The description of the poll')
      )
      .addBooleanOption((option) =>
        option
          .setName('dm_notify')
          .setDescription(
            'Whether the bot should DM you if the poll completed successfully'
          )
      );
    return slashCommand;
  })(),
  async run(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'You can only use this command inside a server.',
      });
      return;
    }
    if (!interaction.channel) {
      await interaction.reply({
        content:
          'You can only use this command in a channel or the client does not have correct intents.',
      });
      return;
    }
    if (interaction.isChatInputCommand()) {
      const buildEmbed = () => {
        let formattedTimeUnit: TimeUnit | string = timeUnit;
        if (time === 1) {
          // 1 hours -> 1 hour
          formattedTimeUnit = formattedTimeUnit.slice(0, -1);
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: member.displayName,
            iconURL: user.displayAvatarURL(),
          })
          .setTitle(title || 'Poll')
          .setDescription(
            description ||
              `React to vote. The poll is going to be available for ${time} ${formattedTimeUnit}`
          )
          .setColor(0x0099ff)
          .setFooter({
            text: 'In case of a draw, a random option is selected',
          });

        shownOptions.forEach(({ label, value, emoji }) => {
          embed.addFields({ name: label, value: `${emoji} - ${value}` });
        });
        return embed;
      };

      const buildButtons = () => {
        return new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('end-poll')
            .setLabel('End poll now')
            .setStyle(ButtonStyle.Primary),
        ]);
      };

      const getTimeInMs = () => {
        switch (timeUnit) {
          case TimeUnit.seconds:
            return time * 1000;
          case TimeUnit.minutes:
            return time * 60 * 1000;
          case TimeUnit.hours:
            return time * 3600 * 1000;
        }
      };

      const buildComponentsCollector = () => {
        return message.createMessageComponentCollector({
          time: timeInMs,
        });
      };

      const buildReactionsCollector = () => {
        const shownEmojisMap = shownOptions.reduce<Record<string, boolean>>(
          (map, { emoji }) => {
            map[emoji] = true;
            return map;
          },
          {}
        );
        return message.createReactionCollector({
          time: timeInMs,
          filter: (reaction) => {
            const emoji = reaction.emoji.name;
            if (!emoji) {
              return false;
            }

            return !!shownEmojisMap[emoji];
          },
        });
      };

      const onComponentsCollect = () => {
        componentsCollector.on('collect', async (componentInteraction) => {
          if (componentInteraction.customId === 'cancel') {
            if (componentInteraction.user.id != user.id) {
              await componentInteraction.fetchReply();
              await componentInteraction.followUp({
                content: 'You cannot cancel this poll',
                ephemeral: true,
              });
              return;
            }
            reactionsCollector.stop('cancel-poll');
            return;
          }

          if (componentInteraction.customId === 'end-poll') {
            if (componentInteraction.user.id != user.id) {
              await componentInteraction.fetchReply();
              await componentInteraction.followUp({
                content: 'You cannot end this poll',
                ephemeral: true,
              });
              return;
            }
            reactionsCollector.stop('end-poll');
            return;
          }
        });
      };

      const addReactions = async () => {
        for (let i = 0; i < shownOptions.length; i++) {
          if (tooFast) {
            return;
          }
          await message.react(shownOptions[i].emoji);
        }
      };

      const onReactionsEnd = () => {
        reactionsCollector.on('end', async (collected, reason) => {
          let mostFrequentEmoji = '';
          let maxCount = 0;

          for (const [key, value] of collected.entries()) {
            if (value.count > maxCount) {
              mostFrequentEmoji = key;
              maxCount = value.count;
            }

            frequencies[key] = value.count;
          }
          tooFast = shownOptions.length != Object.keys(frequencies).length;
          const winner = shownOptions.find(
            ({ emoji }) => emoji === mostFrequentEmoji
          );
          embed
            .setColor(0x00ff00)
            .setDescription(
              `The poll has ended. The winner is ${winner?.value}`
            )
            .setFields([]);

          if (tooFast) {
            embed
              .setDescription(
                'Oops! The poll time is too low for reactions to be added!'
              )
              .setColor(0xff0000)
              .setFooter(null);
          }

          shownOptions.forEach(({ value, emoji }) => {
            embed.addFields({
              name: `Votes for ${value}`,
              value: frequencies[emoji].toString(),
            });
          });

          if (reason === 'cancel-poll') {
            embed
              .setColor(0xff0000)
              .setDescription('This poll was cancelled')
              .setFooter(null);
          }

          await message.reactions.removeAll();

          await message.edit({ embeds: [embed], components: [] });

          if (dmNotify && reason != 'cancel-poll' && !tooFast) {
            await user.send(`Your poll (${message.url}) ended successfully.`);
          }

          void reason;
        });
      };

      const { options, user, guildId, client, channel } = interaction;
      const guild = interaction.guild || (await client.guilds.fetch(guildId));
      const member =
        guild.members.cache.get(user.id) ||
        (await guild.members.fetch(user.id));
      const shownOptions = OPTIONS.map(({ name, description }, i) => ({
        emoji: EMOJIS[i],
        label: description,
        value: options.getString(name),
      })).filter(
        (
          shownOption
        ): shownOption is { emoji: string; label: string; value: string } =>
          !!shownOption.value
      );
      const time = options.getInteger('time', true);
      const timeUnit = options.getString('time_unit', true) as TimeUnit;
      const title = options.getString('title');
      const description = options.getString('description');
      const dmNotify = options.getBoolean('dm_notify') ?? true;

      const embed = buildEmbed();
      const buttons = buildButtons();

      await interaction.reply({
        content: `Poll successfully created`,
      });

      const message = await channel.send({
        embeds: [embed],
        components: [buttons],
      });

      const timeInMs = getTimeInMs();

      const componentsCollector = buildComponentsCollector();
      const reactionsCollector = buildReactionsCollector();

      const frequencies: Record<string, number> = {};

      let tooFast = false;

      await addReactions();
      onComponentsCollect();
      onReactionsEnd();
    }
  },
};

export { PollCommand };
