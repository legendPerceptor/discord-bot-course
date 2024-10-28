import { Client, CommandInteraction } from 'discord.js';
import { SlashCommands } from '../slash-commands';

const handleSlashCommand = async (interaction: CommandInteraction) => {
  const slashCommand = SlashCommands.find(
    (slashCommand) => slashCommand.command.name === interaction.commandName
  );

  if (!slashCommand) {
    await interaction.reply({ content: 'Command not found' });
    return;
  }

  await slashCommand.run(interaction);
};

export const onInteractionCreate = (client: Client) => {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(interaction);
    }
  });
};
