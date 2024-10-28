import { CommandInteraction } from 'discord.js';
import {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from '@discordjs/builders';

export interface SlashCommand {
  command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  run: (interaction: CommandInteraction) => Promise<void>;
}
