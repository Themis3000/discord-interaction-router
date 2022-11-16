import { CallbackRoute, MessageCallback } from "./callback";
import { ButtonInteraction, Client, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

type ButtonInteractionCallback = (client: Client, interaction: ButtonInteraction) => void;

export class ButtonRoute extends CallbackRoute {
  constructor(id: string, interactionCallback: ButtonInteractionCallback = () => undefined, messageCallback: MessageCallback = () => undefined) {
    const transformedInteractionCallback = (client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction) => {
      if (!interaction.isButton())
        return;
      interactionCallback(client, interaction);
    };
    super(id, transformedInteractionCallback, messageCallback);
  }
}
