import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCppG9ocImc1e3HBsDeCZJWaL9IDm9wg2Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to expand the description using AI
const expandDescription = async (description) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Expand the following description to make it more detailed while preserving the original meaning: "${description}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return response.trim();
  } catch (error) {
    console.error("Error expanding description:", error);
    return description; // Return original description if there's an error
  }
};

// Function to generate steps using AI
const generateAISteps = async (title, description, timeframe) => {
  if (!description) return [];

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate detailed task steps for a ${timeframe} timeframe based on the following title and description:
  
  Title: "${title}"
  Description: "${description}"

  Provide steps in this JSON format:
  [
    {
      "title": "Step title",
      "deadline": "Estimated time",
      "mandatory": true/false
    }
  ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Parse JSON from response
    const parsedSteps = JSON.parse(response.replace(/```json|```/g, '').trim());

    return parsedSteps.map(step => ({
      ...step,
      id: Date.now() + Math.random()
    }));
  } catch (error) {
    console.error("Step generation error:", error);
    return [];
  }
};

// Function to review steps using AI
const reviewSteps = async (title, description, steps) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Review the following steps to ensure they align with the original title and description:
  
  Title: "${title}"
  Description: "${description}"
  Steps: ${JSON.stringify(steps, null, 2)}

  Provide feedback and suggest improvements if necessary.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return response.trim();
  } catch (error) {
    console.error("Error reviewing steps:", error);
    return "Unable to review steps at this time.";
  }
};

const StepGenerator = ({ title, description, timeframe, onStepsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSteps = async () => {
    if (!description.trim()) {
      setError("Please provide a description.");
      return;
    }

    // Check if description has at least 5 words
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 5) {
      setError("Description must be at least 5 words long.");
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Expand the description using AI
      const expandedDescription = await expandDescription(description);

      // Generate steps using AI
      const steps = await generateAISteps(title, expandedDescription, timeframe);

      if (steps.length > 0) {
        // Review the steps using AI
        const reviewFeedback = await reviewSteps(title, expandedDescription, steps);
        console.log("Review Feedback:", reviewFeedback);

        onStepsGenerated(steps);
      } else {
        console.warn("No steps generated");
      }
    } catch (error) {
      console.error("AI Step generation error:", error);
      setError("Failed to generate steps. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        onClick={handleGenerateSteps}
        disabled={isGenerating}
        className={`flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg
          ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
      >
        {isGenerating ? 'Generating...' : 'Generate AI Steps'}
      </button>
    </div>
  );
};

export default StepGenerator;