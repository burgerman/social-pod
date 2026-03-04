// app/taste/page.tsx
'use client';
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface DishRecommendation {
  name: string;
  description: string;
  prepTime: string;
  difficulty: string;
  ingredients: string[];
  recipe: string[];
  cuisine: string;
  dietaryTags: string[];
}

interface MealSuggestions {
  summary: string;
  recommendations: DishRecommendation[];
  tips: string[];
}

export default function TasteNavigatorPage() {
  const [preference, setPreference] = useState("Show me some quick and healthy lunch recommendations. Prioritize low-fat, gluten-free and mild dishes with chicken.");
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { RiveComponent } = useRive({
    src: '/broccoli.riv',
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  const generateRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/taste-navigator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preference,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const suggestions: MealSuggestions = await response.json();
      setMealSuggestions(suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#FDE500] px-6 pt-6 pb-6 w-full max-w-md mx-auto">
      {!mealSuggestions ? (
        <>
          {/* Title and subtitle */}
          <div className="w-full flex flex-col items-start mt-5">
            <h1 className="text-7xl font-extrabold leading-none text-black">Taste<br/>Navigator</h1>
            <p className="text-lg font-extrabold text-black mt-1">Tell Mr Brocoli what you're</p>
            <p className="text-lg font-semibold text-black mt-1">craving for your next meal</p>
          </div>

          {/* Mascot */}
          <div className="flex justify-center w-full my-6">
            <div style={{ width: '180px', height: '187px' }}>
              <RiveComponent />
            </div>
          </div>

          {/* Input area */}
          <form className="w-full flex flex-col items-center flex-1" onSubmit={generateRecommendations}>
            <textarea
              className="w-full min-h-[200px] rounded-2xl p-4 text-lg font-semibold text-black bg-white placeholder:text-black/60 focus:outline-none resize-none shadow-md"
              placeholder="I want something healthy and quick for lunch..."
              value={preference}
              onChange={e => setPreference(e.target.value)}
              disabled={isLoading}
            />

            {error && (
              <div className="w-full mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-8 w-full">
              <button
                type="submit"
                disabled={isLoading || !preference.trim()}
                className="w-full bg-black text-white text-lg font-bold py-3 rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Finding Perfect Dishes...' : 'Get Meal Suggestions'}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-white text-black text-lg font-bold py-3 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-black"
              >
                Back to Grocery Plan
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          {/* Results Step */}
          <div className="flex flex-row items-start justify-between w-full">
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-6xl font-extrabold leading-none text-black">Your<br/>Meals</h1>
              <p className="text-lg font-semibold text-black">Bon appétit!</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div style={{ width: '80px', height: '83px' }}>
                <RiveComponent />
              </div>         
            </div>
          </div>

          <div className="w-full flex flex-col mt-6 flex-1 overflow-y-auto">
            {/* Summary */}
            <div className="w-full min-h-[100px] bg-white rounded-2xl p-4 shadow-md mb-4 flex items-center justify-center">
              <p className="font-extrabold text-black text-xl text-center">{mealSuggestions.summary}</p>
            </div>

            {/* Recommendations */}
            {mealSuggestions.recommendations.map((dish, index) => (
              <div key={index} className="w-full bg-white rounded-2xl p-4 shadow-md mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-black text-xl mb-1">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{dish.cuisine} • {dish.prepTime}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(dish.difficulty)}`}>
                    {dish.difficulty}
                  </span>
                </div>
                
                <p className="text-black mb-3">{dish.description}</p>
                
                {dish.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dish.dietaryTags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <details className="cursor-pointer">
                    <summary className="font-semibold text-black">Ingredients ({dish.ingredients.length})</summary>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2 ml-2">
                      {dish.ingredients.map((ingredient, ingIndex) => (
                        <li key={ingIndex}>{ingredient}</li>
                      ))}
                    </ul>
                  </details>
                  
                  <details className="cursor-pointer">
                    <summary className="font-semibold text-black">Recipe</summary>
                    <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 ml-2 space-y-1">
                      {dish.recipe.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </details>
                </div>
              </div>
            ))}

            {/* Tips */}
            {mealSuggestions.tips.length > 0 && (
              <div className="w-full bg-white rounded-2xl p-4 shadow-md mb-4">
                <h3 className="font-bold text-black mb-2">Chef's Tips:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {mealSuggestions.tips.map((tip, index) => (
                    <li key={index} className="text-black text-sm">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => setMealSuggestions(null)}
                className="w-full bg-black text-white text-lg font-bold py-3 rounded-full shadow-lg active:scale-95 transition-transform"
              >
                Try Different Preferences
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full bg-white text-black text-lg font-bold py-3 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-black"
              >
                Back to Grocery Plan
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}