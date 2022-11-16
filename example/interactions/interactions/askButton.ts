import {ButtonInteraction, Client} from "discord.js";
import {ButtonRoute} from "discord-interaction-router";

const interactionHandler = async (client: Client, interaction: ButtonInteraction) => {
  await interaction.reply({content: "Button pushed", ephemeral: true});
}

export default new ButtonRoute("askButton", interactionHandler);
