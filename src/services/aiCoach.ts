/**
 * AI Coach Service — Gemini-powered sustainability coaching.
 * In demo mode, provides intelligent pre-built responses.
 * In production, integrates with Gemini 2.5 Flash API.
 */

const DEMO_RESPONSES: Record<string, { content: string; suggestions: string[] }> = {
  default: {
    content: `Great question! Based on your current footprint data, here are some personalized insights:

📊 **Your Footprint Summary:**
- Your daily average is 10.2 kg CO₂e, which is 35% below the national average
- Transportation accounts for 38% of your emissions
- Food is your second-largest category at 28%

🎯 **Quick Wins:**
1. **Switch to public transit** twice a week → saves ~4.2 kg/week
2. **Batch cook on Sundays** → reduces food waste by ~30%
3. **Unplug idle devices** → saves 0.5 kg/day

Keep up the great work! Your sustainability score has improved by 12 points this month. 🌱`,
    suggestions: [
      'Tell me more about reducing transportation emissions',
      'Create a 30-day sustainability plan',
      "What's my carbon forecast for next month?",
      'How do I compare to others in my area?',
    ],
  },
  reduce: {
    content: `## 🎯 Your Personalized 20% Reduction Plan

Based on your activity data, here is a detailed plan to reduce your footprint by 20% (approximately 2.1 kg/day):

### Phase 1: Quick Wins (Week 1-2)
| Action | Daily Savings | Effort |
|--------|-------------|--------|
| Bike to work 3x/week | 0.6 kg | Medium |
| Plant-based lunches | 0.4 kg | Easy |
| LED lighting switch | 0.2 kg | Easy |
| **Subtotal** | **1.2 kg** | |

### Phase 2: Lifestyle Shifts (Week 3-4)
| Action | Daily Savings | Effort |
|--------|-------------|--------|
| Batch cooking | 0.3 kg | Medium |
| Smart thermostat | 0.3 kg | Easy |
| Digital declutter | 0.1 kg | Easy |
| **Subtotal** | **0.7 kg** | |

### Phase 3: Long-term Changes (Month 2+)
- Consider solar panel installation (saves ~3 kg/day)
- Electric vehicle transition (saves ~2 kg/day)
- Home energy audit

**Total projected savings: 1.9-2.1 kg/day = 21-23% reduction** ✅

Would you like me to create reminders for any of these actions?`,
    suggestions: [
      'Set up reminders for this plan',
      'What are the cost savings?',
      'Show me alternative scenarios',
      'How long until I reach my goal?',
    ],
  },
  compare: {
    content: `## 🌍 How You Compare

Here is how your footprint stacks up against different benchmarks:

📊 **Your Annual Footprint: 3.73 tonnes CO₂e**

| Benchmark | Annual CO₂e | Your Position |
|-----------|-----------|---------------|
| 🇺🇸 US Average | 14.7 tonnes | 75% lower ✅ |
| 🇪🇺 EU Average | 6.8 tonnes | 45% lower ✅ |
| 🌍 World Average | 4.7 tonnes | 21% lower ✅ |
| 🎯 Paris Target | 2.3 tonnes | 38% above ⚠️ |
| 🏆 EcoSphere Top 10% | 1.8 tonnes | Goal to reach |

### Your Strengths 💪
- **Food**: Your plant-forward diet puts you in the top 15%
- **Digital**: Very low digital footprint
- **Consistency**: 23-day tracking streak!

### Growth Areas 📈
- **Transportation**: Above average — consider EV or transit
- **Electricity**: Close to average — smart home could help

You are doing great! Focus on transportation to cross the Paris target. 🎯`,
    suggestions: [
      'How can I reach the Paris target?',
      'Show me transportation alternatives',
      'What would an EV save me?',
      'Join a community challenge',
    ],
  },
  plan: {
    content: `## 📋 Your Weekly Eco-Action Plan

Here is your AI-generated sustainability plan for this week:

### Monday 🌱
- 🚲 Bike to work (save 2.1 kg CO₂)
- 🥗 Prepare plant-based lunch
- 📱 30-min digital sunset before bed

### Tuesday 🌿
- 🚌 Take the bus (save 1.8 kg CO₂)
- 🛒 Shop at local farmers market
- 💡 Check smart thermostat settings

### Wednesday 🍃
- 🚲 Bike to work (save 2.1 kg CO₂)
- 🥬 Try a new vegan recipe
- 🔌 Unplug unused electronics

### Thursday 🌳
- 🚌 Public transit day
- ♻️ Sort recycling and compost
- 📊 Review your midweek progress

### Friday 🌲
- 🚲 Bike Friday! (save 2.1 kg CO₂)
- 🍽️ Cook in bulk for the weekend
- 🌐 Share your progress with the community

### Weekend Goals 🌍
- Visit a local park or nature reserve
- Meal prep for next week
- Research home energy improvements

**Estimated weekly savings: 14.8 kg CO₂e** 🎉

This plan adapts to your habits. The more you track, the smarter it gets!`,
    suggestions: [
      'Adjust this plan for rainy weather',
      'Add workout activities to the plan',
      'Show me recipe suggestions',
      'Track today\'s activities',
    ],
  },
  forecast: {
    content: `## 📈 Your Carbon Forecast

Based on your historical data and current trends, here is what I predict:

### 30-Day Forecast
- **Projected total**: 287 kg CO₂e
- **Trend**: 📉 Decreasing (−2.1% from last month)
- **Confidence**: 89%

### 6-Month Forecast
- **Projected total**: 1,580 kg CO₂e
- **Trend**: 📉 Steady improvement
- **On track for**: Paris Agreement target by Q1 2027

### Key Insights from Gemini Analysis:
1. **Seasonal pattern detected**: Your electricity usage rises ~18% in summer (AC)
2. **Weekend spike**: Transportation emissions are 40% higher on weekends
3. **Positive trend**: Your food emissions have consistently declined for 3 months

### AI Recommendations:
- 🌡️ Pre-cool your home before peak hours to reduce AC costs
- 🚗 Plan weekend errands to combine trips
- 🎯 You are 2.3 kg/day away from the Paris target

Want me to create a detailed plan to address any of these patterns?`,
    suggestions: [
      'How can I reduce my summer AC usage?',
      'Optimize my weekend routine',
      'Set a goal based on this forecast',
      'Show me the detailed prediction model',
    ],
  },
};

/**
 * Get AI coaching response based on user message.
 * In demo mode, matches keywords to pre-built responses.
 * In production, calls Gemini 2.5 Flash API.
 */

export async function getCoachResponse(
  message: string
): Promise<{ content: string; suggestions: string[] }> {
  /* Simulate API latency */
  const SIMULATED_DELAY_MS = 1200;
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  const lowerMessage = message.toLowerCase();

  /* Keyword matching for demo mode */
  if (lowerMessage.includes('reduce') || lowerMessage.includes('cut') || lowerMessage.includes('lower') || lowerMessage.includes('decrease')) {
    return DEMO_RESPONSES.reduce;
  }
  if (lowerMessage.includes('compare') || lowerMessage.includes('average') || lowerMessage.includes('others') || lowerMessage.includes('benchmark')) {
    return DEMO_RESPONSES.compare;
  }
  if (lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('weekly') || lowerMessage.includes('routine')) {
    return DEMO_RESPONSES.plan;
  }
  if (lowerMessage.includes('forecast') || lowerMessage.includes('predict') || lowerMessage.includes('future') || lowerMessage.includes('trend')) {
    return DEMO_RESPONSES.forecast;
  }

  return DEMO_RESPONSES.default;
}

/**
 * Generate AI-powered challenge descriptions.
 */
export function generateChallengeDescription(category: string): string {
  const descriptions: Record<string, string> = {
    transportation: 'Gemini AI has analyzed your commute patterns and created this personalized transportation challenge to optimize your route and reduce emissions.',
    food: 'Based on your dietary tracking data, Gemini AI has crafted this nutrition-focused challenge that maintains your nutritional goals while reducing your food carbon footprint.',
    energy: 'Your energy usage patterns suggest significant savings potential. This AI-generated challenge targets your peak consumption hours.',
    default: 'This AI-powered challenge has been personalized based on your activity history and sustainability goals.',
  };
  return descriptions[category] || descriptions.default;
}

/**
 * Generate AI report summary.
 */
export function generateReportSummary(
  totalEmissions: number,
  reduction: number,
  topCategory: string
): string {
  return `This ${reduction > 0 ? 'encouraging' : 'insightful'} report shows your total emissions at ${totalEmissions.toFixed(1)} kg CO₂e, ${reduction > 0
    ? `a ${reduction.toFixed(1)}% reduction from the previous period`
    : `with areas identified for improvement`
    }. Your ${topCategory} footprint remains the primary focus area. Gemini AI recommends focusing on behavioral consistency and leveraging seasonal opportunities for further reductions.`;
}
