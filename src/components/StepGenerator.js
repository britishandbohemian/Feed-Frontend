import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2 } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyCppG9ocImc1e3HBsDeCZJWaL9IDm9wg2Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generateAISteps = async (description, timeframe, attempt = 1) => {
    if (!description.trim()) return [];

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Set max estimated time per step based on timeframe
    const timeLimits = {
        "short-term": "1-2 hours per step",
        "mid-term": "3-6 hours per step",
        "long-term": "1-2 days per step"
    };

    const maxTimePerStep = timeLimits[timeframe] || "1-4 hours per step";

    const prompt = `You are an expert task planner. Break down the following task into **concise, logical, and efficient steps** based on a **${timeframe} timeframe**:

    **Task Description:**  
    "${description}"
    
    **Guidelines for Step Generation:**  
    - **Each step must be clear, actionable, and focused** (no vague/general steps).  
    - **Ensure steps follow a logical order** (e.g., research before execution).  
    - **Avoid redundant steps or unnecessary details**.  
    - **Estimate realistic step durations** (Max: ${maxTimePerStep}).  
    - **No step should take longer than 2 days**.  
    - **Limit steps to a maximum of 5-7** for clarity.  
    - Use this **valid JSON format**:  

    [
      {
        "title": "Step title",
        "deadline": "Estimated completion time (e.g., 2 hours, 1 day, 30 mins)",
        "mandatory": true/false
      }
    ]  
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        let parsedSteps;
        try {
            parsedSteps = JSON.parse(response.replace(/```json|```/g, '').trim());
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            parsedSteps = [];
        }

        if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
            console.warn(`AI attempt ${attempt} failed. Retrying...`);
            if (attempt < 2) return generateAISteps(description, timeframe, attempt + 1);
            console.warn("AI step generation failed twice. Using fallback steps.");
            return fallbackSteps(timeframe);
        }

        return parsedSteps.map((step, index) => ({
            id: Date.now() + index,
            title: step.title || `Step ${index + 1}`,
            deadline: step.deadline || 'No deadline specified',
            mandatory: step.mandatory ?? false, // Default to false if missing
        }));
    } catch (error) {
        console.error("Step generation error:", error);
        return attempt < 2 ? generateAISteps(description, timeframe, attempt + 1) : fallbackSteps(timeframe);
    }
};

// ✅ Fallback steps if AI fails
const fallbackSteps = (timeframe) => {
    const defaultSteps = {
        "short-term": [
            { id: Date.now() + 1, title: "Identify key requirements", deadline: "30 mins", mandatory: true },
            { id: Date.now() + 2, title: "Set up initial plan", deadline: "1 hour", mandatory: true },
            { id: Date.now() + 3, title: "Execute first milestone", deadline: "2 hours", mandatory: false },
        ],
        "mid-term": [
            { id: Date.now() + 1, title: "Define objectives & resources", deadline: "2 hours", mandatory: true },
            { id: Date.now() + 2, title: "Develop a structured workflow", deadline: "4 hours", mandatory: true },
            { id: Date.now() + 3, title: "Implement key tasks", deadline: "1 day", mandatory: false },
        ],
        "long-term": [
            { id: Date.now() + 1, title: "Break project into milestones", deadline: "1 day", mandatory: true },
            { id: Date.now() + 2, title: "Create a progress timeline", deadline: "2 days", mandatory: true },
            { id: Date.now() + 3, title: "Work on initial phase", deadline: "3 days", mandatory: false },
        ]
    };

    return defaultSteps[timeframe] || defaultSteps["mid-term"];
};

const StepGenerator = ({ description, timeframe, onStepsGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateSteps = async () => {
        if (!description.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            const steps = await generateAISteps(description, timeframe);
            if (steps.length > 0) {
                onStepsGenerated(steps);
            } else {
                console.warn("No valid steps were generated.");
            }
        } catch (error) {
            console.error("AI Step generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleGenerateSteps}
            disabled={isGenerating}
            className={`flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg
        ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
            {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : null}
            {isGenerating ? 'Generating...' : 'Generate AI Steps'}
        </button>
    );
};

export default StepGenerator;
