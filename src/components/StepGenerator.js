import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2 } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyCppG9ocImc1e3HBsDeCZJWaL9IDm9wg2Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define fallbackSteps before it's used
const fallbackSteps = (timeframe) => {
    const defaultSteps = {
        "short-term": [
            {
                id: `step-${Date.now()}-1`,
                title: "Research project requirements",
                deadline: "30 mins",
                mandatory: true,
                completion_criteria: "Document listing all key requirements and constraints",
                dependencies: []
            },
            {
                id: `step-${Date.now()}-2`,
                title: "Create initial project plan",
                deadline: "1 hour",
                mandatory: true,
                completion_criteria: "Detailed project plan document with timeline",
                dependencies: [`step-${Date.now()}-1`]
            },
            {
                id: `step-${Date.now()}-3`,
                title: "Execute first milestone",
                deadline: "2 hours",
                mandatory: true,
                completion_criteria: "First deliverable completed and verified",
                dependencies: [`step-${Date.now()}-2`]
            }
        ],
        // Add similar structures for mid-term and long-term
    };

    return defaultSteps[timeframe] || defaultSteps["short-term"];
};

const generateAISteps = async (description, timeframe, attempt = 1) => {
    if (!description.trim()) return [];

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const timeConstraints = {
        "short-term": {
            maxStep: "2 hours",
            totalTime: "1 day",
            stepRanges: ["15min", "30min", "1hr", "2hr"]
        },
        "mid-term": {
            maxStep: "6 hours",
            totalTime: "1 week",
            stepRanges: ["1hr", "2hr", "4hr", "6hr"]
        },
        "long-term": {
            maxStep: "2 days",
            totalTime: "2 weeks",
            stepRanges: ["2hr", "4hr", "1day", "2day"]
        }
    };

    const timeConfig = timeConstraints[timeframe] || timeConstraints["mid-term"];

    const prompt = `...`; // Your existing prompt

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        let parsedSteps;
        try {
            const cleanJson = response
                .replace(/```json\n?|```/g, '')
                .trim()
                .replace(/[\u200B-\u200D\uFEFF]/g, '');
            parsedSteps = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            console.log("Raw response:", response);
            parsedSteps = [];
        }

        if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
            console.warn(`AI attempt ${attempt} failed. Retrying...`);
            if (attempt < 2) return generateAISteps(description, timeframe, attempt + 1);
            return fallbackSteps(timeframe);
        }

        return parsedSteps.map((step, index) => ({
            id: `step-${Date.now()}-${index}`,
            title: step.title || `Step ${index + 1}`,
            deadline: step.deadline || timeConfig.stepRanges[0],
            mandatory: step.mandatory ?? true,
            completion_criteria: step.completion_criteria || `Complete ${step.title}`,
            dependencies: Array.isArray(step.dependencies) ? step.dependencies : []
        }));
    } catch (error) {
        console.error("Step generation error:", error);
        return attempt < 2 ? generateAISteps(description, timeframe, attempt + 1) : fallbackSteps(timeframe);
    }
};

const StepGenerator = ({ description, timeframe, onStepsGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateSteps = async () => {
        if (!description.trim() || isGenerating) return;

        setIsGenerating(true);
        setError(null);

        try {
            const steps = await generateAISteps(description, timeframe);
            if (steps.length > 0) {
                onStepsGenerated(steps);
            } else {
                setError("Unable to generate steps. Please try again.");
            }
        } catch (error) {
            console.error("Step generation error:", error);
            setError("An error occurred while generating steps.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handleGenerateSteps}
                disabled={isGenerating}
                className={`flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
                {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                {isGenerating ? 'Generating Steps...' : 'Generate AI Steps'}
            </button>
            {error && (
                <div className="text-red-600 text-sm">{error}</div>
            )}
        </div>
    );
};

export default StepGenerator;