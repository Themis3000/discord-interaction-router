import {interactionStepRoute} from "discord-interaction-router";
import {ButtonInteraction, Message, MessageActionRow, MessageButton} from "discord.js";

const askFlow: interactionStepRoute.InteractionSteps = {
  // Define step branches. When an interaction step route is invoked it'll always start on the default branch.
  stepBranches: {
    "default": [
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        // Narrow the type of the incoming interaction (Only required if using typescript, probably just a good idea when using plain js)
        if (!(context.interaction instanceof ButtonInteraction))
          return {success: false};

        // Creates a dm with the user if it doesn't already exist
        if (!context.interaction.user.dmChannel)
          await context.interaction.user.createDM();

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              // The id to advance to the next step is provided for you. No need to think about what the id is to pass it to the next thing.
              .setCustomId(context.nextId)
              .setLabel("Use discord name")
              .setStyle("PRIMARY")
          );

        // Send dm and notification message
        await context.interaction.user.dmChannel?.send({content: "Please enter your email or click the 'use discord name' to signup with discord instead", components: [row]});
        await context.interaction.reply({content: "I've sent you a direct message to complete the signup process"});
        // Let the route know this step has been completed successfully it should move on to the next step.
        // Sets the message channel this route should listen on. Only needed if you want to listen for incoming messages.
        return {success: true, setMsgChannel: context.interaction.user.dmChannel?.id};
      },
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        // Check if this step was invoked by the "use discord name button
        if (context.interaction instanceof ButtonInteraction) {
          // Store username in context data. This value will persist across steps.
          context.data["username"] = context.interaction.user.username;
        } else if (context.interaction instanceof Message) {
          // Validate if sent email is in the format of a valid email address
          const username = context.interaction.content.trim();
          const emailRegex = /^.*@.*\.[A-Za-z]{2,}$/;
          if (!emailRegex.test(username)) {
            await context.interaction.reply({content: "The entered email address was invalid. Please try again."});
            // Report step as unsuccessful if email isn't valid. This tells the route to not advance the step
            return {success: false};
          }
          context.data["username"] = username
        } else {
          return {success: false};
        }

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              // Gets a custom id with an option number. This allows you to tell which button was pressed
              .setCustomId(context.getNextIdWithOption(1))
              .setLabel("Donkeys")
              .setStyle("PRIMARY"),
            new MessageButton()
              .setCustomId(context.getNextIdWithOption(2))
              .setLabel("Turkeys")
              .setStyle("SECONDARY")
          );

        await context.interaction.reply({content: "Are you team donkeys or team turkeys?", components: [row]});
        return {success: true};
      },
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        // Sets the branch depending on what option was selected
        // Uses "passToNext" to pass this current interaction to the next step.
        if (context.optionSelected === 1) {
          context.data["chosenOption"] = "donkeys";
          return {success: true, setBranch: "donkeys", passToNext: true};
        }
        else if (context.optionSelected === 2) {
          context.data["chosenOption"] = "turkeys";
          return {success: true, setBranch: "turkeys", passToNext: true};
        }
        return {success: false};
      }
    ],

    // Branch definition for donkeys
    "donkeys": [
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        if (!(context.interaction instanceof ButtonInteraction))
          return {success: false};

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId(context.getNextIdWithOption(1))
              .setLabel("Yep")
              .setStyle("PRIMARY"),
            new MessageButton()
              .setCustomId(context.getNextIdWithOption(2))
              .setLabel("uh-huh")
              .setStyle("SECONDARY")
          );

        await context.interaction.reply({content: "so you chose donkeys, huh?", components: [row]});
        return {success: true};
      },
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        if (!(context.interaction instanceof ButtonInteraction))
          return {success: false};

        await context.interaction.reply({content: "interesting... why would you choose that? (type your answer)"});
        return {success: true};
      },
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        if (!(context.interaction instanceof Message))
          return {success: false};

        context.data["donkeyJustification"] = context.interaction.content;

        await context.interaction.reply({content: "alright... well I guess I'll sign you up then..."});
        console.log("collected data:");
        console.log(context.data);
        return {success: true};
      }
    ],

    // Branch definition for turkeys
    "turkeys": [
      async (context: interactionStepRoute.StepContext): Promise<interactionStepRoute.StepResult> => {
        if (!(context.interaction instanceof ButtonInteraction))
          return {success: false};

        await context.interaction.reply({content: "This is the correct option. Thank you. Signing up your account."});
        console.log("collected data:");
        console.log(context.data);
        return {success: true};
      }
    ]
  }
}

// Create a unique name for the class. Never name 2 classes the same thing.
const askFlowCls = interactionStepRoute.createRouteCls("askFlow", askFlow);
export default askFlowCls;
