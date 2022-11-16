import { CallbackRoute, MessageCallback } from "./callback";
import { Client, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

type ModalInteractionCallback = (client: Client, interaction: ModalSubmitInteraction) => void;

export class ModalRoute extends CallbackRoute {
  constructor(id: string, interactionCallback: ModalInteractionCallback = () => undefined, messageCallback: MessageCallback = () => undefined) {
    const transformedInteractionCallback = (client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction) => {
      if (!interaction.isModalSubmit())
        return;
      interactionCallback(client, interaction);
    };
    super(id, transformedInteractionCallback, messageCallback);
  }
}
