/**
 * Popular subscription services with metadata for smart autocomplete
 * Includes pricing, logos, colors, and categories for common services
 */

export interface PopularService {
  name: string;
  category: string;
  color: string;
  logoUrl?: string;
  website?: string;
  commonPricing?: {
    amount: number; // in dollars
    currency: string;
    cycle: 'monthly' | 'annually';
    description?: string;
  }[];
}

export const popularServices: PopularService[] = [
  // Streaming Entertainment
  {
    name: "Netflix",
    category: "Entertainment",
    color: "#E50914",
    website: "https://netflix.com",
    commonPricing: [
      { amount: 15.49, currency: "USD", cycle: "monthly", description: "Standard" },
      { amount: 22.99, currency: "USD", cycle: "monthly", description: "Premium" }
    ]
  },
  {
    name: "Disney+",
    category: "Entertainment",
    color: "#113CCF",
    website: "https://disneyplus.com",
    commonPricing: [
      { amount: 7.99, currency: "USD", cycle: "monthly" },
      { amount: 79.99, currency: "USD", cycle: "annually" }
    ]
  },
  {
    name: "Hulu",
    category: "Entertainment",
    color: "#00ED82",
    website: "https://hulu.com",
    commonPricing: [
      { amount: 7.99, currency: "USD", cycle: "monthly", description: "Basic" },
      { amount: 17.99, currency: "USD", cycle: "monthly", description: "No Ads" }
    ]
  },
  {
    name: "HBO Max",
    category: "Entertainment",
    color: "#673AB7",
    website: "https://max.com",
    commonPricing: [
      { amount: 15.99, currency: "USD", cycle: "monthly" }
    ]
  },
  {
    name: "Amazon Prime Video",
    category: "Entertainment",
    color: "#00A8E1",
    website: "https://primevideo.com",
    commonPricing: [
      { amount: 8.99, currency: "USD", cycle: "monthly" },
      { amount: 139, currency: "USD", cycle: "annually", description: "Prime membership" }
    ]
  },
  {
    name: "Apple TV+",
    category: "Entertainment",
    color: "#000000",
    website: "https://tv.apple.com",
    commonPricing: [
      { amount: 6.99, currency: "USD", cycle: "monthly" }
    ]
  },

  // Music Streaming
  {
    name: "Spotify",
    category: "Music",
    color: "#1DB954",
    website: "https://spotify.com",
    commonPricing: [
      { amount: 10.99, currency: "USD", cycle: "monthly", description: "Premium" },
      { amount: 16.99, currency: "USD", cycle: "monthly", description: "Family" }
    ]
  },
  {
    name: "Apple Music",
    category: "Music",
    color: "#FA243C",
    website: "https://music.apple.com",
    commonPricing: [
      { amount: 10.99, currency: "USD", cycle: "monthly", description: "Individual" },
      { amount: 16.99, currency: "USD", cycle: "monthly", description: "Family" }
    ]
  },
  {
    name: "YouTube Music",
    category: "Music",
    color: "#FF0000",
    website: "https://music.youtube.com",
    commonPricing: [
      { amount: 10.99, currency: "USD", cycle: "monthly" }
    ]
  },
  {
    name: "Tidal",
    category: "Music",
    color: "#000000",
    website: "https://tidal.com",
    commonPricing: [
      { amount: 10.99, currency: "USD", cycle: "monthly", description: "Premium" }
    ]
  },

  // Development & Productivity
  {
    name: "GitHub",
    category: "Development",
    color: "#333333",
    website: "https://github.com",
    commonPricing: [
      { amount: 4, currency: "USD", cycle: "monthly", description: "Pro" },
      { amount: 21, currency: "USD", cycle: "monthly", description: "Team" }
    ]
  },
  {
    name: "Figma",
    category: "Design",
    color: "#F24E1E",
    website: "https://figma.com",
    commonPricing: [
      { amount: 12, currency: "USD", cycle: "monthly", description: "Professional" },
      { amount: 45, currency: "USD", cycle: "monthly", description: "Organization" }
    ]
  },
  {
    name: "Adobe Creative Cloud",
    category: "Design",
    color: "#DA1F26",
    website: "https://adobe.com",
    commonPricing: [
      { amount: 52.99, currency: "USD", cycle: "monthly", description: "All Apps" },
      { amount: 22.99, currency: "USD", cycle: "monthly", description: "Photography" }
    ]
  },
  {
    name: "Notion",
    category: "Productivity",
    color: "#000000",
    website: "https://notion.so",
    commonPricing: [
      { amount: 8, currency: "USD", cycle: "monthly", description: "Plus" },
      { amount: 15, currency: "USD", cycle: "monthly", description: "Business" }
    ]
  },
  {
    name: "Slack",
    category: "Productivity",
    color: "#4A154B",
    website: "https://slack.com",
    commonPricing: [
      { amount: 7.25, currency: "USD", cycle: "monthly", description: "Pro" },
      { amount: 12.50, currency: "USD", cycle: "monthly", description: "Business+" }
    ]
  },
  {
    name: "Zoom",
    category: "Productivity",
    color: "#2D8CFF",
    website: "https://zoom.us",
    commonPricing: [
      { amount: 14.99, currency: "USD", cycle: "monthly", description: "Pro" },
      { amount: 19.99, currency: "USD", cycle: "monthly", description: "Business" }
    ]
  },

  // Cloud Storage
  {
    name: "Google Drive",
    category: "Utilities",
    color: "#4285F4",
    website: "https://drive.google.com",
    commonPricing: [
      { amount: 1.99, currency: "USD", cycle: "monthly", description: "100GB" },
      { amount: 2.99, currency: "USD", cycle: "monthly", description: "200GB" },
      { amount: 9.99, currency: "USD", cycle: "monthly", description: "2TB" }
    ]
  },
  {
    name: "Dropbox",
    category: "Utilities",
    color: "#0061FF",
    website: "https://dropbox.com",
    commonPricing: [
      { amount: 9.99, currency: "USD", cycle: "monthly", description: "Plus 2TB" },
      { amount: 16.58, currency: "USD", cycle: "monthly", description: "Family 2TB" }
    ]
  },
  {
    name: "iCloud+",
    category: "Utilities",
    color: "#007AFF",
    website: "https://icloud.com",
    commonPricing: [
      { amount: 0.99, currency: "USD", cycle: "monthly", description: "50GB" },
      { amount: 2.99, currency: "USD", cycle: "monthly", description: "200GB" },
      { amount: 9.99, currency: "USD", cycle: "monthly", description: "2TB" }
    ]
  },

  // Health & Fitness
  {
    name: "Planet Fitness",
    category: "Health & Fitness",
    color: "#7B3F99",
    website: "https://planetfitness.com",
    commonPricing: [
      { amount: 10, currency: "USD", cycle: "monthly", description: "Classic" },
      { amount: 22.99, currency: "USD", cycle: "monthly", description: "Black Card" }
    ]
  },
  {
    name: "Peloton",
    category: "Health & Fitness",
    color: "#000000",
    website: "https://onepeloton.com",
    commonPricing: [
      { amount: 12.99, currency: "USD", cycle: "monthly", description: "App" },
      { amount: 44, currency: "USD", cycle: "monthly", description: "All-Access" }
    ]
  },
  {
    name: "MyFitnessPal",
    category: "Health & Fitness",
    color: "#0072CE",
    website: "https://myfitnesspal.com",
    commonPricing: [
      { amount: 9.99, currency: "USD", cycle: "monthly", description: "Premium" }
    ]
  },

  // News & Media
  {
    name: "The New York Times",
    category: "News & Media",
    color: "#000000",
    website: "https://nytimes.com",
    commonPricing: [
      { amount: 17, currency: "USD", cycle: "monthly", description: "Digital" }
    ]
  },
  {
    name: "The Wall Street Journal",
    category: "News & Media",
    color: "#0F1419",
    website: "https://wsj.com",
    commonPricing: [
      { amount: 38.99, currency: "USD", cycle: "monthly", description: "Digital" }
    ]
  },

  // Gaming
  {
    name: "PlayStation Plus",
    category: "Entertainment",
    color: "#003791",
    website: "https://playstation.com",
    commonPricing: [
      { amount: 9.99, currency: "USD", cycle: "monthly", description: "Essential" },
      { amount: 14.99, currency: "USD", cycle: "monthly", description: "Extra" }
    ]
  },
  {
    name: "Xbox Game Pass",
    category: "Entertainment",
    color: "#107C10",
    website: "https://xbox.com",
    commonPricing: [
      { amount: 9.99, currency: "USD", cycle: "monthly", description: "Console" },
      { amount: 14.99, currency: "USD", cycle: "monthly", description: "Ultimate" }
    ]
  },

  // Education & Learning
  {
    name: "Coursera",
    category: "Education",
    color: "#0056D3",
    website: "https://coursera.org",
    commonPricing: [
      { amount: 39, currency: "USD", cycle: "monthly", description: "Plus" }
    ]
  },
  {
    name: "MasterClass",
    category: "Education",
    color: "#000000",
    website: "https://masterclass.com",
    commonPricing: [
      { amount: 180, currency: "USD", cycle: "annually", description: "Individual" }
    ]
  }
];

// Helper functions for autocomplete
export const searchServices = (query: string): PopularService[] => {
  if (!query.trim()) return [];

  const lowercaseQuery = query.toLowerCase();

  return popularServices.filter(service =>
    service.name.toLowerCase().includes(lowercaseQuery) ||
    service.category.toLowerCase().includes(lowercaseQuery)
  ).slice(0, 5); // Limit to top 5 results
};

export const getServiceByName = (name: string): PopularService | undefined => {
  return popularServices.find(service =>
    service.name.toLowerCase() === name.toLowerCase()
  );
};

export const getServicesByCategory = (category: string): PopularService[] => {
  return popularServices.filter(service =>
    service.category.toLowerCase() === category.toLowerCase()
  );
};