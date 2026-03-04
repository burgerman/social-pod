import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { preference } = await request.json();

    if (!preference) {
      return NextResponse.json(
        { error: "Preference is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Mr. Brocoli, a helpful culinary assistant. You must respond with only valid JSON, no additional text.

          Generate meal recommendations with this exact JSON structure:
          {
            "summary": "Brief description of the recommendations based on user preference",
            "recommendations": [
              {
                "name": "Dish name",
                "description": "Brief description of the dish and why it fits the preference",
                "prepTime": "15-20 min",
                "difficulty": "Easy",
                "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
                "recipe": ["Step 1", "Step 2", "Step 3"],
                "cuisine": "Italian",
                "dietaryTags": ["Vegetarian", "Mild", "Low-fat", "Gluten-free"]
              }
            ],
            "tips": ["Cooking tip 1", "Cooking tip 2", "Preparation tip"]
          }

          Rules:
          - Respond only with VALID JSON
          - Generate 2 or 3 dish recommendations that match the user's taste
          - Analyze the user's preference to determine:
            * Dietary restrictions (vegetarian, vegan, low-fat, low-calorie, gluten-free, etc.)
            * Time constraints (quick, slow-cooked, meal prep)
            * Flavor preferences (spicy, mild, sweet, savory)
            * Cooking skill level (beginner, intermediate, advanced)
            * Cuisine preferences (Italian, Chinese, Mexican, Indian, etc.)
          - Include commonly available ingredients
          - Provide clear, step-by-step recipe accordingly
          - Provide appropriate difficulty levels: "Easy", "Medium", "Hard"
          - Include relevant dietary tags like: "Vegetarian", "Vegan", "Gluten-free", "Low-fat", "High-protein", "Low-calorie"
          - Prep time should be realistic (e.g., "10-15 min", "20-30 min", "1 hour")
          - Include ingredients per dish
          - Provide useful cooking tips and preparation advice
          - Match the cuisine style to the preference when possible`
        },
        {
          role: "user",
          content: `User preference: ${preference}

Analyze my preference and recommend dishes that perfectly match what I'm looking for. Include complete recipes with ingredients and step-by-step recipe.`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.4,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("No response from Groq");
    }

    console.log("Raw Groq response:", responseContent);

    // Clean up the response - remove any markdown formatting or extra text
    let cleanedResponse = responseContent.trim();
    
    // Remove markdown json code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    
    // Find JSON object boundaries
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!parsedResponse.summary || !parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
        throw new Error("Invalid JSON structure");
      }
      
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      console.error("Cleaned response:", cleanedResponse);
      
      // Extract information manually if JSON parsing fails
      const summaryMatch = cleanedResponse.match(/"summary":\s*"([^"]+)"/);
      const summary = summaryMatch ? summaryMatch[1] : "Perfect meal recommendations based on your preferences!";
      
      // Create a fallback structured response based on preference
      const isHealthy = preference.toLowerCase().includes('healthy') || preference.toLowerCase().includes('nutritious') || preference.toLowerCase().includes('clean');
      const isQuick = preference.toLowerCase().includes('quick') || preference.toLowerCase().includes('fast') || preference.toLowerCase().includes('easy') || preference.toLowerCase().includes('30 min');
      const isVegetarian = preference.toLowerCase().includes('vegetarian') || preference.toLowerCase().includes('veggie') || preference.toLowerCase().includes('plant');
      const isVegan = preference.toLowerCase().includes('vegan');
      const isProtein = preference.toLowerCase().includes('protein') || preference.toLowerCase().includes('muscle') || preference.toLowerCase().includes('bulk');
      const isComfort = preference.toLowerCase().includes('comfort') || preference.toLowerCase().includes('cozy') || preference.toLowerCase().includes('warm');
      const isSpicy = preference.toLowerCase().includes('spicy') || preference.toLowerCase().includes('hot') || preference.toLowerCase().includes('kick');
      
      let fallbackRecommendations = [];
      
      if (isHealthy) {
        fallbackRecommendations.push({
          name: "Quinoa Buddha Bowl",
          description: "A nutritious bowl packed with protein, fiber, and fresh vegetables that supports your healthy eating goals",
          prepTime: "25-30 min",
          difficulty: "Easy",
          ingredients: ["quinoa", "chickpeas", "avocado", "spinach", "cherry tomatoes", "cucumber", "lemon", "olive oil"],
          recipe: [
            "Cook quinoa according to package directions and let cool",
            "Drain and rinse chickpeas, season with salt and pepper",
            "Wash and chop all vegetables into bite-sized pieces",
            "Arrange quinoa as base, top with vegetables and chickpeas",
            "Drizzle with lemon juice and olive oil before serving"
          ],
          cuisine: "Mediterranean",
          dietaryTags: isVegan ? ["Vegan", "High-protein", "Gluten-free"] : ["Vegetarian", "High-protein", "Gluten-free"]
        });
      }
      
      if (isQuick) {
        fallbackRecommendations.push({
          name: "Chicken Stir Fry",
          description: "A quick and flavorful dish that comes together in under 20 minutes with simple ingredients",
          prepTime: "15-20 min",
          difficulty: "Easy",
          ingredients: ["chicken breast", "mixed vegetables", "soy sauce", "garlic", "ginger", "sesame oil", "rice"],
          recipe: [
            "Cut chicken into thin strips and season with salt",
            "Heat oil in a large pan or wok over high heat",
            "Cook chicken until golden and cooked through, about 5 minutes",
            "Add vegetables and stir fry for 3-4 minutes",
            "Add garlic, ginger, and soy sauce, toss to combine",
            "Serve immediately over cooked rice"
          ],
          cuisine: "Asian",
          dietaryTags: ["High-protein", "Quick-cooking"]
        });
      }
      
      if (isVegetarian || isVegan) {
        fallbackRecommendations.push({
          name: "Lentil Curry",
          description: "A hearty and flavorful plant-based curry that's rich in protein and warming spices",
          prepTime: "35-40 min",
          difficulty: "Medium",
          ingredients: ["red lentils", "coconut milk", "onion", "garlic", "ginger", "curry powder", "diced tomatoes", "spinach"],
          recipe: [
            "Sauté diced onion until translucent, about 5 minutes",
            "Add minced garlic and ginger, cook for 1 minute",
            "Stir in curry powder and cook until fragrant",
            "Add lentils, tomatoes, and coconut milk, bring to boil",
            "Simmer for 20-25 minutes until lentils are tender",
            "Stir in fresh spinach and cook until wilted"
          ],
          cuisine: "Indian",
          dietaryTags: isVegan ? ["Vegan", "High-protein", "Gluten-free"] : ["Vegetarian", "High-protein", "Gluten-free"]
        });
      }
      
      if (isComfort) {
        fallbackRecommendations.push({
          name: "One-Pot Pasta",
          description: "A hearty, comforting meal that's made entirely in one pot for easy cleanup and maximum coziness",
          prepTime: "25-30 min",
          difficulty: "Easy",
          ingredients: ["pasta", "ground meat or mushrooms", "onion", "garlic", "diced tomatoes", "broth", "herbs", "cheese"],
          recipe: [
            "Brown meat (or mushrooms) in a large pot",
            "Add diced onion and cook until soft",
            "Add garlic and cook for 1 minute",
            "Add pasta, tomatoes, broth, and herbs",
            "Bring to boil, then simmer until pasta is cooked",
            "Stir in cheese and serve immediately"
          ],
          cuisine: "Italian-American",
          dietaryTags: isVegetarian ? ["Vegetarian", "Comfort food"] : ["Comfort food"]
        });
      }
      
      // If we don't have enough recommendations, add a default one
      if (fallbackRecommendations.length < 2) {
        fallbackRecommendations.push({
          name: "Classic Grilled Chicken with Vegetables",
          description: "A simple, versatile dish that can be customized with your favorite seasonings and vegetables",
          prepTime: "20-25 min",
          difficulty: "Easy",
          ingredients: ["chicken breast", "mixed vegetables", "olive oil", "herbs", "garlic", "lemon"],
          recipe: [
            "Season chicken with herbs, salt, and pepper",
            "Heat grill pan or outdoor grill to medium-high heat",
            "Grill chicken for 6-7 minutes per side until cooked through",
            "Meanwhile, sauté vegetables with garlic and olive oil",
            "Let chicken rest for 5 minutes, then slice",
            "Serve chicken with vegetables and a squeeze of lemon"
          ],
          cuisine: "American",
          dietaryTags: ["High-protein", "Low-carb"]
        });
      }
      
      // Only take first 2 recommendations
      if (fallbackRecommendations.length > 2) {
        fallbackRecommendations = fallbackRecommendations.slice(0, 2);
      }
      
      const fallbackTips = [
        isHealthy ? "Prep vegetables in advance for quicker assembly" : "Use pre-cut vegetables to save time",
        "Season generously with herbs and spices for maximum flavor",
        isQuick ? "Keep ingredients simple but high-quality" : "Don't be afraid to customize with your favorite ingredients",
        isVegetarian ? "Add nuts or seeds for extra protein and crunch" : "Let meat rest after cooking for better texture"
      ];
      
      parsedResponse = {
        summary: summary || `Perfect ${isHealthy ? 'healthy' : isQuick ? 'quick' : isComfort ? 'comfort' : 'delicious'} meal recommendations based on your preferences!`,
        recommendations: fallbackRecommendations,
        tips: fallbackTips.slice(0, 3)
      };
    }

    return NextResponse.json(parsedResponse);
    
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return NextResponse.json(
      { error: "Failed to generate meal recommendations" },
      { status: 500 }
    );
  }
}