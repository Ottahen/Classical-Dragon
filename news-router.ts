import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

const NEWS_TEMPLATES = [
  {
    category: "LLM",
    templates: [
      "OpenAI announces GPT-5 with breakthrough reasoning capabilities",
      "Anthropic's Claude 4 shows emergent behavior in coding tasks",
      "Google unveils Gemini 2.0 with real-time multimodal processing",
      "Meta releases Llama 4 as fully open-source model",
      "Mistral AI raises $500M for next-generation European LLM",
      "DeepSeek's new model achieves GPT-4 level at fraction of cost",
      "xAI's Grok 3 integrates real-time web search natively",
      "Cohere launches enterprise-focused Command R+ model",
      "AI21 Labs releases Jamba 2 with 1M token context window",
      "Stability AI pivots to language models with Stable LM Pro",
    ],
  },
  {
    category: "Robotics",
    templates: [
      "Boston Dynamics' Atlas demonstrates parkour in warehouse setting",
      "Figure AI's humanoid robot begins factory trial shifts",
      "Tesla Optimus Gen 3 shows dexterous manipulation skills",
      "1X Technologies' NEO robot enters beta home testing",
      "Unitree's quadruped robots deployed in search-and-rescue",
      "Google DeepMind's RT-3 enables general-purpose robot control",
      "Agility Robotics' Digit handles 1000 packages per hour",
      "Apptronik partners with NASA for lunar robot assistant",
      "Chinese startup unveils $10,000 humanoid for homes",
      "Shadow Robot's telepresence system reaches 0.1ms latency",
    ],
  },
  {
    category: "Research",
    templates: [
      "Stanford breakthrough: AI solves protein folding in hours",
      "MIT researchers develop neuromorphic chip 1000x more efficient",
      "DeepMind's AlphaFold 3 predicts all biomolecule structures",
      "OpenAI's Sora generates 1-hour coherent video sequences",
      "Meta FAIR releases new computer vision benchmark suite",
      "Google's quantum-AI hybrid system cracks optimization problems",
      "Microsoft Research proposes new attention mechanism: Mamba-2",
      "NVIDIA's Eureka enables robot training without human demos",
      "Berkeley AI Research open-sources large-scale RL framework",
      "CMU team achieves near-human speech synthesis quality",
    ],
  },
  {
    category: "Policy",
    templates: [
      "EU AI Act enforcement begins with first compliance deadline",
      "US Senate passes comprehensive AI safety legislation",
      "China mandates watermarking on all AI-generated content",
      "UK launches AI Safety Institute with $100M funding",
      "UN proposes global AI governance framework",
      "California passes law requiring AI model safety audits",
      "Japan relaxes AI training data copyright restrictions",
      "Brazil's new AI bill focuses on algorithmic transparency",
      "Singapore launches national AI competency framework",
      "India announces $1B investment in sovereign AI infrastructure",
    ],
  },
  {
    category: "Funding",
    templates: [
      "Anthropic raises $4B from Amazon at $18B valuation",
      "Mistral AI closes $640M Series B led by General Catalyst",
      "Cohere secures $500M at $5.5B valuation",
      "Perplexity AI hits $3B valuation after new funding round",
      "CoreWeave raises $7.5B for AI cloud infrastructure",
      "Character.ai acquisition by Google rumored at $2B",
      "ElevenLabs reaches $3B valuation after Series C",
      "Poolside raises $500M for AI coding assistant",
      "Safe Superintelligence Inc raises $1B from top VCs",
      "Hugging Face closes $235M at $4.5B valuation",
    ],
  },
  {
    category: "Hardware",
    templates: [
      "NVIDIA announces Blackwell B200 with 20 petaflops FP4",
      "AMD unveils MI350X to challenge NVIDIA's AI dominance",
      "Intel's Gaudi 3 claims 40% better inference than H100",
      "Google's TPU v6 achieves 5x training speed improvement",
      "Apple's M4 Ultra chip features dedicated AI accelerator",
      "Qualcomm's Snapdragon X Elite brings AI to edge devices",
      "Cerebras reveals WSE-3 with 4 trillion transistors",
      "SambaNova launches DataScale SN40L for enterprise AI",
      "Groq's LPU achieves 800 tokens/sec on Llama 3",
      "AWS Trainium3 chips promise 2x performance per watt",
    ],
  },
];

const SOURCES = [
  "TechCrunch",
  "The Verge",
  "ArsTechnica",
  "VentureBeat",
  "Wired",
  "MIT Tech Review",
];

function generateNewsItems(seed: number, limit: number) {
  const items = [];
  const now = Date.now();

  for (let i = 0; i < limit; i++) {
    const categoryIdx = (seed + i) % NEWS_TEMPLATES.length;
    const category = NEWS_TEMPLATES[categoryIdx];
    const templateIdx = (seed + i * 7) % category.templates.length;
    const sourceIdx = (seed + i * 3) % SOURCES.length;
    const minutesAgo = ((seed + i * 13) % 60) + 1;

    items.push({
      id: `news-${seed}-${i}`,
      title: category.templates[templateIdx],
      summary: `Latest developments in ${category.category.toLowerCase()} show significant progress. Industry analysts predict major implications for the AI landscape in coming months.`,
      category: category.category,
      source: SOURCES[sourceIdx],
      timestamp: new Date(now - minutesAgo * 60000),
      readTime: `${(seed + i * 5) % 4 + 2} min read`,
    });
  }

  return items;
}

export const newsRouter = createRouter({
  getLatest: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(({ input }) => {
      const limit = input?.limit ?? 20;
      const category = input?.category;
      const seed = Math.floor(Date.now() / 60000); // Changes every minute

      let items = generateNewsItems(seed, limit * 2);

      if (category) {
        items = items.filter((item) => item.category === category);
      }

      return items.slice(0, limit);
    }),

  getCategories: publicQuery.query(() => {
    return [
      { name: "LLM", count: 156 },
      { name: "Robotics", count: 89 },
      { name: "Research", count: 234 },
      { name: "Policy", count: 67 },
      { name: "Funding", count: 112 },
      { name: "Hardware", count: 78 },
    ];
  }),
});
