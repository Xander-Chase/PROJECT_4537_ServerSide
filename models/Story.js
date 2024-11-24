import mongoose from 'mongoose';

// Collection name for Story
const COLLECTIONNAME = "Story";

// Default title for new stories
const DEFAULTTITLE = "Untitled Story";

// Schema for Story

// In Story's Schema, this is what content represents
// a list of StoryContentObjects
export class StoryContentObject
{
  constructor(description, prompts, chosenPrompt)
  {
    this.description = description; // 1
    this.prompts = prompts; // 4
    this.chosenPrompt = chosenPrompt ?? ""; // 1
  }

  // Setter for choosing a prompt. Actually never used.
  setChosenPrompt = (chosenPrompt) =>
  {
    this.chosenPrompt = chosenPrompt;
  }
}

// Story Schema
const StorySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // User ID to reference the user
  title: { type: String, default: DEFAULTTITLE }, // Title of the story
  summary: { type: String, default: "" }, // Summary of the story
  content: {type: Array, default: []}, // StoryContentObject
  updated: { type: Date, default: Date.now } // Last updated date, will not include like a sorting algorithm for this anymore
});

// Model for Story, to be used in controllers
const Story = mongoose.model(COLLECTIONNAME, StorySchema);

// Export the model
export default Story;