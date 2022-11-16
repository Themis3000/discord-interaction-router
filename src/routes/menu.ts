import { CallbackRoute, MessageCallback } from "./callback";
import { Client, MessageComponentInteraction, ModalSubmitInteraction, SelectMenuInteraction } from "discord.js";

type MenuInteractionCallback = (client: Client, interaction: SelectMenuInteraction) => void;

export class MenuRoute extends CallbackRoute {
  constructor(id: string, interactionCallback: MenuInteractionCallback = () => undefined, messageCallback: MessageCallback = () => undefined) {
    const transformedInteractionCallback = (client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction) => {
      if (!interaction.isSelectMenu())
        return;
      interactionCallback(client, interaction);
    };
    super(id, transformedInteractionCallback, messageCallback);
  }
}
