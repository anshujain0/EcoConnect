const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Using gemini 
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
  }

  async analyzeImage(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const prompt = `You are an expert waste management AI. Analyze this image and determine if it shows a RECYCLABLE, DISPOSABLE, or REUSABLE ITEM.

IMPORTANT: Only accept images that show:
- Electronic waste (phones, computers, batteries, etc.)
- Plastic items (bottles, containers, bags, etc.)
- Metal items (cans, tools, scrap metal, etc.)
- Fabric/Clothing (old clothes, textiles, bags, etc.)
- Glass items (bottles, jars, etc.)
- Paper/Cardboard (newspapers, boxes, books, etc.)
- Organic waste (food waste, garden waste, etc.)
- Hazardous waste (paint cans, chemicals, etc.)

REJECT images that show:
- People, selfies, portraits
- Landscapes, scenery, nature photos
- Prepared food, meals, dishes
- Pets, animals
- Buildings, architecture
- Vehicles (unless clearly scrap/waste)
- Random objects not related to waste/recycling
- Unclear or blurry images

Provide a JSON response with this structure:
{
  "is_valid_item": true/false,
  "rejection_reason": "reason why this is not a recyclable item" (only if is_valid_item is false),
  "material": "primary material type" (only if is_valid_item is true),
  "item_name": "specific item name" (only if is_valid_item is true),
  "description": "brief description" (only if is_valid_item is true),
  "condition_estimate": "estimated condition" (only if is_valid_item is true),
  "confidence": "your confidence level (high/medium/low)"
}

Be strict - only accept genuine waste/recyclable items.`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: this.getMimeType(imagePath)
      }
    };

    console.log('Calling Gemini AI...');
    
    const result = await this.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const textResponse = response.text();
    
    console.log('Gemini Response:', textResponse);
    
    // Extract JSON from response
    let jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    } else {
      jsonMatch[0] = jsonMatch[1];
    }

    if (!jsonMatch) {
      console.error('Could not extract JSON from response:', textResponse);
      throw new Error('Failed to parse AI response');
    }

    const parsedResult = JSON.parse(jsonMatch[0]);
    
    // Check if item is valid
    if (!parsedResult.is_valid_item) {
      return {
        is_valid_item: false,
        rejection_reason: parsedResult.rejection_reason || 'This image does not appear to contain a recyclable or disposable item. Please upload an image of waste, old items, or recyclables.',
        confidence: parsedResult.confidence
      };
    }
    
    // Map to category system
    parsedResult.category = this.mapToCategory(parsedResult.material);
    
    return parsedResult;

  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    throw new Error('Failed to analyze image with AI');
  }
}

  getMimeType(imagePath) {
    const ext = imagePath.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  mapToCategory(material) {
    const materialLower = material.toLowerCase();
    
    const categoryMap = {
      plastic: ['plastic', 'polymer', 'polythene', 'pet', 'hdpe', 'pvc'],
      metal: ['metal', 'aluminum', 'aluminium', 'steel', 'iron', 'copper', 'brass', 'tin'],
      ewaste: ['electronic', 'e-waste', 'ewaste', 'circuit', 'battery', 'phone', 'computer', 'laptop', 'device'],
      fabric: ['fabric', 'cloth', 'textile', 'cotton', 'polyester', 'clothes', 'clothing', 'garment'],
      glass: ['glass', 'bottle', 'jar'],
      paper: ['paper', 'cardboard', 'carton', 'newspaper'],
      organic: ['organic', 'food', 'compost', 'biodegradable', 'waste'],
      hazardous: ['hazardous', 'chemical', 'toxic', 'paint', 'oil', 'battery']
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => materialLower.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  async generateFollowUpQuestions(category, itemName) {
    const questionSets = {
      plastic: [
        {
          id: 'condition',
          question: 'What is the current condition?',
          options: ['New/Unused', 'Lightly Used', 'Moderately Used', 'Heavily Used', 'Broken']
        },
        {
          id: 'size',
          question: 'What is the approximate size?',
          options: ['Small (fits in hand)', 'Medium (backpack size)', 'Large (furniture size)', 'Very Large']
        },
        {
          id: 'cleanliness',
          question: 'Is it clean and ready for recycling?',
          options: ['Yes, completely clean', 'Needs minor cleaning', 'Needs major cleaning', 'Cannot be cleaned']
        },
        {
          id: 'intent',
          question: 'What do you want to do with it?',
          options: ['Sell if valuable', 'Donate to someone', 'Recycle responsibly', 'Just dispose safely']
        }
      ],
      metal: [
        {
          id: 'condition',
          question: 'What is the current condition?',
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Scrap only']
        },
        {
          id: 'weight',
          question: 'Approximate weight?',
          options: ['Very light (<1kg)', 'Light (1-5kg)', 'Medium (5-20kg)', 'Heavy (>20kg)']
        },
        {
          id: 'type',
          question: 'What type of metal item?',
          options: ['Appliance', 'Vehicle part', 'Utensil/Tool', 'Structural/Building', 'Other']
        },
        {
          id: 'intent',
          question: 'What do you want to do with it?',
          options: ['Sell as scrap', 'Sell as item', 'Donate', 'Recycle']
        }
      ],
      ewaste: [
        {
          id: 'functionality',
          question: 'Does it still work?',
          options: ['Yes, fully functional', 'Partially working', 'Not working', 'Not sure']
        },
        {
          id: 'age',
          question: 'How old is the device?',
          options: ['Less than 1 year', '1-3 years', '3-5 years', 'More than 5 years']
        },
        {
          id: 'data',
          question: 'Does it contain personal data?',
          options: ['Yes, needs wiping', 'Already wiped', 'No data storage', 'Not applicable']
        },
        {
          id: 'intent',
          question: 'What do you want to do with it?',
          options: ['Sell if working', 'Donate', 'E-waste recycling', 'Repair first']
        }
      ],
      fabric: [
        {
          id: 'condition',
          question: 'What is the condition?',
          options: ['Like new', 'Gently used', 'Worn but usable', 'Damaged/Torn', 'Only for recycling']
        },
        {
          id: 'quantity',
          question: 'How much fabric/clothing?',
          options: ['Single item', 'Few items (2-5)', 'Several items (6-10)', 'Many items (10+)']
        },
        {
          id: 'type',
          question: 'What type of fabric items?',
          options: ['Clothing', 'Home textiles (curtains, sheets)', 'Bags/Accessories', 'Raw fabric']
        },
        {
          id: 'intent',
          question: 'What do you want to do with it?',
          options: ['Sell online', 'Donate to needy', 'Textile recycling', 'Upcycle/Reuse']
        }
      ],
      glass: [
        {
          id: 'condition',
          question: 'What is the condition?',
          options: ['Intact', 'Chipped/Cracked', 'Broken']
        },
        {
          id: 'type',
          question: 'What type of glass item?',
          options: ['Bottle', 'Jar', 'Window/Mirror', 'Decorative', 'Other']
        },
        {
          id: 'cleanliness',
          question: 'Is it clean?',
          options: ['Yes, clean', 'Needs cleaning', 'Very dirty']
        },
        {
          id: 'intent',
          question: 'What do you want to do with it?',
          options: ['Recycle', 'Reuse/Repurpose', 'Dispose safely']
        }
      ],
      paper: [
        {
          id: 'type',
          question: 'What type of paper?',
          options: ['Newspaper/Magazine', 'Cardboard/Box', 'Office paper', 'Books', 'Mixed']
        },
        {
          id: 'quantity',
          question: 'How much paper?',
          options: ['Small amount', 'Medium (bag full)', 'Large (multiple bags)', 'Very large']
        },
        {
          id: 'condition',
          question: 'Condition of the paper?',
          options: ['Clean and dry', 'Slightly soiled', 'Wet/damaged', 'Mixed quality']
        },
        {
          id: 'intent',
          question: 'What do you want to do with it?',
          options: ['Recycle', 'Sell to scrap dealer', 'Donate (books)', 'Dispose']
        }
      ],
      default: [
        {
          id: 'condition',
          question: 'What is the current condition?',
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']
        },
        {
          id: 'age',
          question: 'How old is it approximately?',
          options: ['Less than 6 months', '6 months - 2 years', '2-5 years', 'More than 5 years']
        },
        {
          id: 'usability',
          question: 'Can it still be used?',
          options: ['Yes, fully usable', 'With minor repairs', 'With major repairs', 'No, beyond repair']
        },
        {
          id: 'intent',
          question: 'What do you want to do with it?',
          options: ['Sell', 'Donate', 'Recycle', 'Dispose']
        }
      ]
    };

    return questionSets[category] || questionSets.default;
  }
}

module.exports = new GeminiService();