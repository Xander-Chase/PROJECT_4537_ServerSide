import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const COLLECTIONNAME = "Story";
const DEFAULTTITLE = "Untitled Story";

export class StoryContentObject
{
  constructor(description, prompts, chosenPrompt)
  {
    this.description = description; // 1
    this.prompts = prompts; // 4
    this.chosenPrompt = chosenPrompt ?? ""; // 1
  }

  setChosenPrompt(chosenPrompt)
  {
    this.chosenPrompt = chosenPrompt;
  }
}

const StorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, default: DEFAULTTITLE },
  summary: { type: String, default: "" },
  content: {type: Array, default: []}, // StoryContentObject
  updated: { type: Date, default: Date.now }
});

const Story = mongoose.model(COLLECTIONNAME, StorySchema);
export default Story;