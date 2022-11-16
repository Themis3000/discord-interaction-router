import {
  Client,
  Interaction,
  ModalSubmitInteraction,
  MessageComponentInteraction,
  CommandInteraction
} from "discord.js";
import { commandRouter, redisInteractionRouter, staticInteractionRouter } from "../routers";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    // Uses the command router if the interaction is a command
    if (interaction instanceof CommandInteraction) {
      await commandRouter.useCommand(client, interaction);
      return;
    }

    if (interaction instanceof MessageComponentInteraction || interaction instanceof ModalSubmitInteraction) {
      // Tries the static interaction router. Returns if a route was used
      const usedStaticInteraction = await staticInteractionRouter.useInteractionRoute(client, interaction);
      if (usedStaticInteraction)
        return;

      // Tries the redis interaction router. Returns if a route was used
      const usedRedisInteraction = await redisInteractionRouter.useInteractionRoute(client, interaction);
      if (usedRedisInteraction)
        return;
    }
  });
};
