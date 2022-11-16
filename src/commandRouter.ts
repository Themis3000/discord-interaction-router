import { ChatInputApplicationCommandData, Client, CommandInteraction } from "discord.js";

export interface Command {
  commandData: ChatInputApplicationCommandData,
  run: (client: Client, interaction: CommandInteraction) => Promise<void>;
}

export class CommandRouter {
  private commands: Record<string, Command> = {};

  public addCommand(command: Command): void {
    this.commands[command.commandData.name] = command;
  }

  public getCommands(): ChatInputApplicationCommandData[] {
    return Object.values(this.commands).map(command => command.commandData);
  }

  public async useCommand(client: Client, interaction: CommandInteraction): Promise<boolean> {
    if (!(interaction.commandName in this.commands))
      return false;
    const command = this.commands[interaction.commandName];
    await command.run(client, interaction);
    return true;
  }
}
