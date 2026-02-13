class RecommendationService {
  
  generateRecommendation(category, itemName, userAnswers, aiAnalysis) {
    const intent = userAnswers.intent;
    const condition = userAnswers.condition;
    const functionality = userAnswers.functionality;
    
    let recommendation = {
      action: '',
      reasoning: '',
      estimatedValue: null,
      olxSearchUrl: null,
      tips: []
    };

    switch (category) {
      case 'ewaste':
        recommendation = this.handleEwaste(itemName, userAnswers, aiAnalysis);
        break;
      case 'plastic':
        recommendation = this.handlePlastic(itemName, userAnswers);
        break;
      case 'metal':
        recommendation = this.handleMetal(itemName, userAnswers);
        break;
      case 'fabric':
        recommendation = this.handleFabric(itemName, userAnswers);
        break;
      case 'glass':
        recommendation = this.handleGlass(itemName, userAnswers);
        break;
      case 'paper':
        recommendation = this.handlePaper(itemName, userAnswers);
        break;
      default:
        recommendation = this.handleGeneric(itemName, userAnswers);
    }

    return recommendation;
  }

  handleEwaste(itemName, answers) {
    const functionality = answers.functionality;
    const age = answers.age;
    const intent = answers.intent;
    const data = answers.data;

    let action = 'E-waste Recycling';
    let reasoning = '';
    let estimatedValue = null;
    let tips = [];

    if (functionality === 'Yes, fully functional' && age === 'Less than 1 year') {
      action = 'Sell';
      reasoning = 'Your device is functional and relatively new. You can sell it online to get good value.';
      estimatedValue = this.estimateEwasteValue(itemName, functionality, age);
      tips.push('Take clear photos from multiple angles');
      tips.push('Include original box and accessories if available');
      tips.push('Mention warranty status');
    } else if (functionality === 'Yes, fully functional' || functionality === 'Partially working') {
      action = 'Sell or Donate';
      reasoning = 'Your device still works. Consider selling at a lower price or donating to schools/NGOs.';
      estimatedValue = this.estimateEwasteValue(itemName, functionality, age);
      tips.push('Check if local NGOs accept working electronics');
      tips.push('Schools often need computers for students');
    } else {
      action = 'E-waste Recycling';
      reasoning = 'Non-functional electronics should be recycled properly to recover valuable materials and prevent environmental harm.';
      tips.push('Never throw electronics in regular trash');
      tips.push('Remove batteries before recycling');
      if (data === 'Yes, needs wiping') {
        tips.push('⚠️ IMPORTANT: Wipe all personal data before recycling');
      }
    }

    return {
      action,
      reasoning,
      estimatedValue,
      olxSearchUrl: estimatedValue ? this.generateOlxUrl(itemName) : null,
      tips
    };
  }

  handlePlastic(itemName, answers) {
    const condition = answers.condition;
    const cleanliness = answers.cleanliness;
    const intent = answers.intent;

    let action = 'Recycle';
    let reasoning = '';
    let tips = [];

    if (condition === 'New/Unused' && itemName.toLowerCase().includes('bottle')) {
      action = 'Reuse or Donate';
      reasoning = 'Unused plastic items can be reused or donated instead of recycling.';
      tips.push('Consider using as storage containers');
      tips.push('Donate to community centers or schools');
    } else if (cleanliness === 'Yes, completely clean' || cleanliness === 'Needs minor cleaning') {
      action = 'Recycle';
      reasoning = 'Clean plastic can be recycled effectively. This helps reduce plastic pollution.';
      tips.push('Rinse containers before recycling');
      tips.push('Remove caps and labels if possible');
      tips.push('Check the recycling symbol (1-7) on the item');
    } else {
      action = 'Dispose';
      reasoning = 'Heavily contaminated plastic cannot be recycled and should be disposed properly.';
      tips.push('Try to clean if possible before disposal');
      tips.push('Use designated waste bins');
    }

    return {
      action,
      reasoning,
      estimatedValue: null,
      olxSearchUrl: null,
      tips
    };
  }

  handleMetal(itemName, answers) {
    const condition = answers.condition;
    const weight = answers.weight;
    const type = answers.type;

    let action = 'Sell as Scrap';
    let reasoning = '';
    let estimatedValue = null;
    let tips = [];

    if (condition === 'Excellent' || condition === 'Good') {
      action = 'Sell';
      reasoning = 'Metal items in good condition have resale value. You can sell them online or to scrap dealers.';
      estimatedValue = this.estimateMetalValue(itemName, weight, condition);
      tips.push('Clean the item before selling');
      tips.push('Take photos showing the condition');
    } else {
      action = 'Sell as Scrap';
      reasoning = 'Metal can be sold to scrap dealers who will recycle it. Even damaged metal has value.';
      estimatedValue = this.estimateScrapValue(weight);
      tips.push('Separate different types of metals for better rates');
      tips.push('Remove non-metal parts if possible');
    }

    return {
      action,
      reasoning,
      estimatedValue,
      olxSearchUrl: estimatedValue && condition !== 'Scrap only' ? this.generateOlxUrl(itemName) : null,
      tips
    };
  }

  handleFabric(itemName, answers) {
    const condition = answers.condition;
    const quantity = answers.quantity;
    const type = answers.type;

    let action = 'Donate';
    let reasoning = '';
    let tips = [];

    if (condition === 'Like new' || condition === 'Gently used') {
      action = 'Sell or Donate';
      reasoning = 'Good condition clothing can be sold online or donated to those in need.';
      tips.push('Wash and iron before selling/donating');
      tips.push('Take clear photos for online selling');
      tips.push('Bundle similar items for better deals');
    } else if (condition === 'Worn but usable') {
      action = 'Donate';
      reasoning = 'Wearable clothes should be donated to NGOs serving underprivileged communities.';
      tips.push('Donate to local NGOs or homeless shelters');
      tips.push('Check if items are clean before donating');
    } else {
      action = 'Textile Recycling';
      reasoning = 'Damaged fabric can be recycled into new materials or used for industrial purposes.';
      tips.push('Cut into cleaning rags for home use');
      tips.push('Textile recyclers accept damaged clothing');
    }

    return {
      action,
      reasoning,
      estimatedValue: condition === 'Like new' ? 100 : null,
      olxSearchUrl: condition === 'Like new' ? this.generateOlxUrl(itemName) : null,
      tips
    };
  }

  handleGlass(itemName, answers) {
    const condition = answers.condition;
    
    let action = 'Recycle';
    let reasoning = '';
    let tips = [];

    if (condition === 'Intact') {
      action = 'Reuse or Recycle';
      reasoning = 'Intact glass items can be reused for storage or recycled.';
      tips.push('Clean and reuse for storage');
      tips.push('Donate to craft centers');
      tips.push('Recycle at glass collection points');
    } else if (condition === 'Broken') {
      action = 'Dispose Safely';
      reasoning = 'Broken glass should be wrapped and disposed safely to prevent injuries.';
      tips.push('Wrap in newspaper or cardboard');
      tips.push('Mark the package as "BROKEN GLASS"');
      tips.push('Use designated disposal bins');
    }

    return {
      action,
      reasoning,
      estimatedValue: null,
      olxSearchUrl: null,
      tips
    };
  }

  handlePaper(itemName, answers) {
    const type = answers.type;
    const quantity = answers.quantity;
    const condition = answers.condition;

    let action = 'Recycle';
    let reasoning = 'Paper is highly recyclable and helps save trees.';
    let estimatedValue = null;
    let tips = [];

    if (type === 'Books' && condition === 'Clean and dry') {
      action = 'Donate or Sell';
      reasoning = 'Books in good condition can be donated to libraries or sold online.';
      tips.push('Donate to schools or libraries');
      tips.push('Sell on online marketplaces');
    } else if (quantity === 'Large (multiple bags)' || quantity === 'Very large') {
      action = 'Sell to Scrap Dealer';
      reasoning = 'Large quantities of paper can be sold to scrap dealers.';
      estimatedValue = this.estimatePaperValue(quantity);
      tips.push('Sort by type (newspaper, cardboard, white paper)');
      tips.push('Ensure paper is dry');
    } else {
      tips.push('Remove staples and clips');
      tips.push('Keep paper dry before recycling');
    }

    return {
      action,
      reasoning,
      estimatedValue,
      olxSearchUrl: null,
      tips
    };
  }

  handleGeneric(itemName, answers) {
    const condition = answers.condition;
    const usability = answers.usability;

    let action = 'Recycle';
    let reasoning = 'Consider the best disposal method based on item condition.';
    let tips = ['Contact local waste management for guidance'];

    if (condition === 'Excellent' || condition === 'Good') {
      action = 'Sell or Donate';
      reasoning = 'Items in good condition should be reused by selling or donating.';
    }

    return {
      action,
      reasoning,
      estimatedValue: null,
      olxSearchUrl: null,
      tips
    };
  }

  estimateEwasteValue(itemName, functionality, age) {
    const itemLower = itemName.toLowerCase();
    let baseValue = 0;

    if (itemLower.includes('laptop')) baseValue = 15000;
    else if (itemLower.includes('phone') || itemLower.includes('mobile')) baseValue = 8000;
    else if (itemLower.includes('tablet')) baseValue = 10000;
    else if (itemLower.includes('computer') || itemLower.includes('desktop')) baseValue = 12000;
    else if (itemLower.includes('monitor')) baseValue = 3000;
    else baseValue = 2000;

    // Depreciate based on age
    if (age === 'Less than 1 year') baseValue *= 0.7;
    else if (age === '1-3 years') baseValue *= 0.5;
    else if (age === '3-5 years') baseValue *= 0.3;
    else baseValue *= 0.15;

    // Adjust for functionality
    if (functionality === 'Partially working') baseValue *= 0.5;
    else if (functionality === 'Not working') baseValue *= 0.2;

    return Math.round(baseValue);
  }

  estimateMetalValue(itemName, weight, condition) {
    let pricePerKg = 50; // Average scrap metal price
    let weightKg = 5; // Default estimate

    if (weight === 'Very light (<1kg)') weightKg = 0.5;
    else if (weight === 'Light (1-5kg)') weightKg = 3;
    else if (weight === 'Medium (5-20kg)') weightKg = 12;
    else if (weight === 'Heavy (>20kg)') weightKg = 30;

    let value = weightKg * pricePerKg;

    if (condition === 'Excellent') value *= 2;
    else if (condition === 'Good') value *= 1.5;

    return Math.round(value);
  }

  estimateScrapValue(weight) {
    let weightKg = 5;
    if (weight === 'Very light (<1kg)') weightKg = 0.5;
    else if (weight === 'Light (1-5kg)') weightKg = 3;
    else if (weight === 'Medium (5-20kg)') weightKg = 12;
    else if (weight === 'Heavy (>20kg)') weightKg = 30;

    return Math.round(weightKg * 40); // ₹40 per kg average
  }

  estimatePaperValue(quantity) {
    let weightKg = 1;
    if (quantity === 'Small amount') weightKg = 1;
    else if (quantity === 'Medium (bag full)') weightKg = 5;
    else if (quantity === 'Large (multiple bags)') weightKg = 20;
    else if (quantity === 'Very large') weightKg = 50;

    return Math.round(weightKg * 10); // ₹10 per kg
  }

  generateOlxUrl(itemName) {
    const searchQuery = encodeURIComponent(itemName.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim());
    return `https://www.olx.in/items/q-${searchQuery}`;
  }
}

module.exports = new RecommendationService();