import { CallbackRoute, MessageCallback } from "./callback";
import { Client, CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

type CommandInteractionCallback = (client: Client, interaction: CommandInteraction) => void;

export class CommandRoute extends CallbackRoute {
  constructor(id: string, interactionCallback: CommandInteractionCallback = () => undefined, messageCallback: MessageCallback = () => undefined) {
    const transformedInteractionCallback = (client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction) => {
      if (!interaction.isCommand())
        return;
      interactionCallback(client, interaction);
    };
    super(id, transformedInteractionCallback, messageCallback);
  }
}
