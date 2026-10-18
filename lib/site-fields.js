export const CATEGORIES = [
  ["Artificial Intelligence", "🤖"],
  ["Productivity", "🚀"],
  ["Education", "📚"],
  ["No Code", "🧩"],
  ["Social Media", "💬"],
  ["E-Commerce", "🛒"],
  ["Analytics", "📊"],
  ["Web 3", "💎"],
  ["Design Tools", "🎨"],
  ["Developer Tools", "🛠️"],
  ["Marketing", "📣"],
  ["Finance", "💰"],
  ["Others", "👻"],
];

export const STATUSES = [
  ["Building...", "🧱"],
  ["Active", "🟢"],
  ["On hold", "🌙"],
  ["For Sale", "🏷️"],
  ["Acquired", "🤝"],
  ["Discontinued", "✖️"],
];

export const CHARTS = [
  ["area", "Area chart"],
  ["line", "Line chart"],
  ["bar", "Bar chart"],
  ["combined", "Combined chart"],
];

export const CATEGORY_VALUES = CATEGORIES.map(([value]) => value);
export const STATUS_VALUES = STATUSES.map(([value]) => value);
export const CHART_VALUES = CHARTS.map(([value]) => value);
