import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCppG9ocImc1e3HBsDeCZJWaL9IDm9wg2Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generateAISteps = async (description, timeframe) => {
    if (!description) return [];

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `Generate detailed task steps for a ${timeframe} timeframe based on this description: 
  "${description}". 
  
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

const StepGenerator = ({ description, timeframe, onStepsGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateSteps = async () => {
        setIsGenerating(true);
        try {
            const steps = await generateAISteps(description, timeframe);
            onStepsGenerated(steps);
        } catch (error) {
            console.error(error);
        }
        setIsGenerating(false);
    };

    return (
        <button
            onClick={handleGenerateSteps}
            disabled={!description || isGenerating}
            className={`
        flex items-center justify-center 
        bg-blue-600 text-white 
        px-4 py-2 rounded-lg
        ${!description ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
      `}
        >
            {isGenerating ? 'Generating...' : 'Generate AI Steps'}
        </button>
    );
};

export default StepGenerator;