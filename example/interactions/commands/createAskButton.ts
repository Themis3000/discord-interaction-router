import {Command} from "discord-interaction-router";
import {Client, CommandInteraction, MessageActionRow, MessageButton} from "discord.js";

const createAskButtonCommand: Command = {
  commandData: {
    name: "createAskButton",
    description: "Creates the ask button",
    type: "CHAT_INPUT"
  },
  run: async (client: Client, interaction: CommandInteraction) => {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("askButton")
          .setLabel("Ask")
          .setStyle("PRIMARY")
      )
    await interaction.reply({content: "Here's your ask button!", components: [row]})
  }
};

export default createAskButtonCommand;
