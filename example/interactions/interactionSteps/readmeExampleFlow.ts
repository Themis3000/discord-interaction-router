import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  SelectMenuBuilder,
  SelectMenuInteraction
} from "discord.js";
import {interactionStepRoute} from "discord-interaction-router";

const signupFlow: interactionStepRoute.InteractionSteps = {
  // Define a command handler. This is only needed if you intend for this flow to be invoked by a command.
  // Each one of these functions is a single step
  commandHandler: async (context: interactionStepRoute.CommandContext): Promise<interactionStepRoute.StepResult> => {
    const row = new ActionRowBuilder<SelectMenuBuilder>()
      .addComponents(
        new SelectMenuBuilder()
          // The id for the next step is provided for you.
          .setCustomId(context.nextId)
          .setPlaceholder("Please select an option")
          .addOptions({label: "option 1", value: "1"}, {label: "option 2", value: "2"}, {label: "option 3", value: "3"})
      );

    await context.interaction.reply({content: "Select an option", components: [row]});
    // Mark step as completed. Tells the route to move on to expecting the next step
    return {success: true};
  },
  stepBranches: {
    "default": [
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        // Narrow the incoming interaction type
        if (!(context.interaction instanceof SelectMenuInteraction))
          return {success: false};

        // Read and store data from the last interaction
        // Data stored in context.data is persisted between steps (must be json serializable)
        context.data["optionChosen"] = context.interaction.values[0];

        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              // Gets a custom id with an option number. This allows you to tell which button was pressed
              .setCustomId(context.getNextIdWithOption(1))
              .setLabel("Yes")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(context.getNextIdWithOption(2))
              .setLabel("No")
              .setStyle(ButtonStyle.Secondary)
          );

        await context.interaction.reply({content: `You have slected option ${context.data.optionChosen}, would you like to continue?`, components: [row]});
        return {success: true};
      },
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        if (!(context.interaction instanceof ButtonInteraction))
          return {success: false};

        // Check which button option was selected
        if (context.optionSelected === 1) {
          context.interaction.reply({content: "Recorded answer!"});
          console.log("Recorded data:");
          console.log(context.data);
          return {success: true};
        } else if (context.optionSelected === 2) {
          context.interaction.reply({content: "Did not record answer"});
          return {success: true};
        }
        return {success: false};
      }
    ]
  }
}

// Create a unique name for the class. Never name 2 classes the same thing.
const SignupFlow = interactionStepRoute.createRouteCls("signupFlow", signupFlow);
export default SignupFlow;
