import {ButtonInteraction, Client} from "discord.js";
import {ButtonRoute} from "discord-interaction-router";
import askFlowCls from "../interactionSteps/askFlow";
import {redisInteractionRouter} from "../../routers";

const interactionHandler = async (client: Client, interaction: ButtonInteraction) => {
  // Create a new ask flow instance
  const route = new askFlowCls();
  // Add the ask flow instance to the redis router. Pass the interaction to let the first step handle this interaction.
  await redisInteractionRouter.addRoute(route, {interaction, client});
}

export default new ButtonRoute("askButton", interactionHandler);
