import { Word } from "./mockWords";

export interface Article {
  id: string;
  title: string;
  category: string; // e.g., News, Story, Tech
  level: string; // e.g., Beginner, Intermediate, Advanced
  readTime: string; // e.g., 5 min
  content: string; // Full text content
  words: Word[]; // Associated vocabulary (for quick lookup)
}

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'The Future of AI',
    category: 'Technology',
    level: 'Advanced',
    readTime: '8 min',
    content: `Artificial Intelligence (AI) is transforming the world at an unprecedented pace. From self-driving cars to intelligent virtual assistants, AI technologies are becoming integral to our daily lives.

    One of the most significant impacts of AI is in the field of healthcare. Machine learning algorithms can analyze vast amounts of medical data to identify patterns and predict diseases earlier than ever before. For instance, AI-powered diagnostic tools are assisting radiologists in detecting abnormalities in medical images with high accuracy.

    However, the rapid advancement of AI also raises ethical concerns. Issues such as data privacy, algorithmic bias, and the potential displacement of jobs need to be addressed. As we embrace the benefits of AI, it is crucial to establish robust frameworks to ensure its responsible development and deployment.`,
    words: []
  },
  {
    id: '2',
    title: 'A Walk in the Woods',
    category: 'Story',
    level: 'Beginner',
    readTime: '5 min',
    content: `Yesterday, I went for a walk in the woods near my house. The sun was shining, and the birds were singing. It was a beautiful day.

    I walked along a narrow path that wound through the trees. The leaves were turning yellow and orange, signaling the arrival of autumn. I saw a squirrel scampering up a tree and a rabbit hiding in the bushes.

    After walking for about an hour, I found a quiet spot by a small stream. I sat down on a rock and listened to the sound of the water flowing over the stones. It was very peaceful. I felt relaxed and happy.`,
    words: []
  },
  {
    id: '3',
    title: 'Global Climate Change',
    category: 'News',
    level: 'Intermediate',
    readTime: '6 min',
    content: `Climate change is one of the most pressing challenges facing our planet today. Rising global temperatures are leading to more frequent and severe weather events, such as hurricanes, droughts, and floods.

    Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of global warming. The release of greenhouse gases into the atmosphere traps heat, causing the Earth's temperature to rise.

    To combat climate change, countries around the world are working together to reduce carbon emissions. Investing in renewable energy sources like solar and wind power is a key strategy. Additionally, individuals can contribute by adopting sustainable habits, such as reducing energy consumption and recycling.`,
    words: []
  }
];
