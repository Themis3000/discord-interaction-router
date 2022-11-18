import {Command} from "discord-interaction-router";
import {
  Client,
  CommandInteraction,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const createAskButtonCommand: Command = {
  commandData: {
    name: "createaskbutton",
    description: "Creates the ask button",
    type: ApplicationCommandType.ChatInput
  },
  run: async (client: Client, interaction: CommandInteraction) => {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("askButton")
          .setLabel("Ask")
          .setStyle(ButtonStyle.Primary)
      )
    await interaction.reply({content: "Here's your ask button!", components: [row]})
  }
};

export default createAskButtonCommand;
