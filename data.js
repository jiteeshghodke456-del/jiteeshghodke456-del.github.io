// ─── Roadmap Phases ─────────────────────────────────────────
const PHASES = [
  {
    id: 0,
    label: "800 → 1000",
    color: "#a8a29e",
    accent: "#78716c",
    title: "Build the foundation",
    duration: "~6 weeks · Python",
    ratingFrom: 800,
    ratingTo: 1000,
    coreTopics: ["Implementation", "Basic math", "Sorting", "Brute force", "Strings"],
    supportTopics: ["Ad-hoc", "Greedy (easy)", "Modular arithmetic", "GCD/LCM"],
    tips: [
      "Solve 3-4 problems/day (800-900 rated)",
      "Upsolve every failed problem within 30 min",
      "Time yourself — 15-20 min limit per problem",
      "Read carefully, translate logic cleanly"
    ],
    weekday: "2 × 800 + 1 × 900 rated (~90 min)",
    weekend: "1 full Div.3 / Div.4 virtual contest",
    switchNote: null,
    resources: [
      { text: "CF Problemset 800-900", url: "https://codeforces.com/problemset?tags=implementation&order=BY_RATING_ASC" },
      { text: "CSES Problem Set (Intro)", url: "https://cses.fi/problemset/list/" }
    ],
    videos: [
      { text: "Competitive Programming for Beginners — Errichto", url: "https://www.youtube.com/watch?v=xAeiXy8-9Y8" },
      { text: "How to start CP — William Lin", url: "https://www.youtube.com/watch?v=bVKHRtafgPc" },
      { text: "Solve 800-rated CF problems — Colin Galen", url: "https://www.youtube.com/watch?v=y7169jEvb-Y" },
      { text: "Basic Math for CP — NeetCode", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
    ],
    topicLinks: [
      { topic: "Implementation", url: "https://codeforces.com/problemset?tags=implementation&order=BY_RATING_ASC" },
      { topic: "Basic math", url: "https://cp-algorithms.com/algebra/fundamentals.html" },
      { topic: "Sorting", url: "https://visualgo.net/en/sorting" },
      { topic: "Brute force", url: "https://codeforces.com/problemset?tags=brute+force&order=BY_RATING_ASC" },
      { topic: "Strings", url: "https://codeforces.com/problemset?tags=strings&order=BY_RATING_ASC" },
      { topic: "Greedy", url: "https://cp-algorithms.com/others/all.html" },
      { topic: "GCD/LCM", url: "https://cp-algorithms.com/algebra/euclid-algorithm.html" }
    ]
  },
  {
    id: 1,
    label: "1000 → 1300",
    color: "#22c55e",
    accent: "#16a34a",
    title: "Switch to C++ + core patterns",
    duration: "~6 weeks · C++",
    ratingFrom: 1000,
    ratingTo: 1300,
    coreTopics: ["Two pointers", "Prefix sums", "Binary search", "Greedy", "Frequency arrays"],
    supportTopics: ["Sliding window", "Sorting tricks", "Constructive", "Basic number theory"],
    tips: [
      "Learn C++ basics week 1 — cin/cout, vectors, pairs, sorting",
      "Use a 30-line template with fast I/O",
      "Practice 20 binary search problems in a row",
      "Debug with assertions, not guesses"
    ],
    weekday: "2 × 1000-1200 rated (pattern focus)",
    weekend: "Div.3 virtual + 1hr deep topic study",
    switchNote: "Switch Python → C++ here. Python TLEs on 1200+. Week 1: rewrite your last 10 Python solutions in C++.",
    resources: [
      { text: "C++ STL — cp-algorithms", url: "https://cp-algorithms.com/" },
      { text: "CSES — Sorting & Searching", url: "https://cses.fi/problemset/list/" },
      { text: "CF Edu — Binary Search", url: "https://codeforces.com/edu/course/2/lesson/6" }
    ],
    videos: [
      { text: "C++ for CP — Complete Guide — Luv", url: "https://www.youtube.com/watch?v=EAR7De6Goz4" },
      { text: "Binary Search tutorial — Errichto", url: "https://www.youtube.com/watch?v=GU7DpgHINWQ" },
      { text: "Two Pointers technique — take U forward", url: "https://www.youtube.com/watch?v=pMnGR1ZINig" },
      { text: "Prefix Sums made easy — NeetCode", url: "https://www.youtube.com/watch?v=7pJo_rM0z_s" }
    ],
    topicLinks: [
      { topic: "Two pointers", url: "https://cp-algorithms.com/others/two_pointer.html" },
      { topic: "Prefix sums", url: "https://usaco.guide/silver/prefix-sums" },
      { topic: "Binary search", url: "https://codeforces.com/edu/course/2/lesson/6" },
      { topic: "Greedy", url: "https://codeforces.com/problemset?tags=greedy&order=BY_RATING_ASC" },
      { topic: "Sliding window", url: "https://usaco.guide/gold/sliding-window" }
    ]
  },
  {
    id: 2,
    label: "1300 → 1600",
    color: "#3b82f6",
    accent: "#2563eb",
    title: "Data structures + graph basics",
    duration: "~6 weeks · C++",
    ratingFrom: 1300,
    ratingTo: 1600,
    coreTopics: ["BFS / DFS", "Stacks & queues", "Maps & sets", "Graph representation", "Flood fill"],
    supportTopics: ["Topological sort", "Union-Find (DSU)", "Recursion & backtracking", "Simulation"],
    tips: [
      "BFS + DFS solve 30% of 1300-1500 problems",
      "Master set, multiset, map, priority_queue",
      "Implement DSU once — 15 lines, know it cold",
      "Track solved problems by tag to find weak spots"
    ],
    weekday: "2 × 1200-1500 rated (weakest tag bias)",
    weekend: "Div.2 virtual — aim A+B+C, study D editorial",
    switchNote: null,
    resources: [
      { text: "cp-algorithms — Graphs", url: "https://cp-algorithms.com/graph/breadth-first-search.html" },
      { text: "CSES — Graph Algorithms", url: "https://cses.fi/problemset/list/" },
      { text: "CF Edu — DSU", url: "https://codeforces.com/edu/course/2/lesson/7" }
    ],
    videos: [
      { text: "Graph Algorithms for CP — William Lin", url: "https://www.youtube.com/watch?v=09_LlHjoEiY" },
      { text: "BFS & DFS explained — Abdul Bari", url: "https://www.youtube.com/watch?v=pcKY4hjDrxk" },
      { text: "Union Find — take U forward", url: "https://www.youtube.com/watch?v=aBxjDBC4M1U" },
      { text: "Topological Sort — William Fiset", url: "https://www.youtube.com/watch?v=eL-KzMXSXXI" }
    ],
    topicLinks: [
      { topic: "BFS / DFS", url: "https://cp-algorithms.com/graph/breadth-first-search.html" },
      { topic: "Union-Find", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html" },
      { topic: "Topological sort", url: "https://cp-algorithms.com/graph/topological-sort.html" },
      { topic: "Graph representation", url: "https://usaco.guide/silver/graph-traversal" },
      { topic: "Flood fill", url: "https://usaco.guide/silver/flood-fill" }
    ]
  },
  {
    id: 3,
    label: "1600 → 1800",
    color: "#f59e0b",
    accent: "#d97706",
    title: "DP + advanced algorithms",
    duration: "~6 weeks · C++",
    ratingFrom: 1600,
    ratingTo: 1800,
    coreTopics: ["DP (1D/2D)", "Shortest paths (Dijkstra)", "Binary search on answer", "Combinatorics"],
    supportTopics: ["Tree DP", "Bitmask DP", "Modular exponentiation", "Sparse table", "LCA basics"],
    tips: [
      "Spend 2 full weeks only on DP — do 30+ problems",
      "Write dp[i][j] = meaning in plain English before coding",
      "Binary search on answer ≠ binary search on sorted array",
      "Read editorials even after solving — find elegant approaches"
    ],
    weekday: "1 × 1500-1800 + 30 min editorial review",
    weekend: "Div.2 virtual — solve A,B,C fast; attempt D",
    switchNote: null,
    resources: [
      { text: "Atcoder DP Contest (26 problems)", url: "https://atcoder.jp/contests/dp" },
      { text: "cp-algorithms — DP", url: "https://cp-algorithms.com/dynamic_programming/divide-and-conquer-dp.html" },
      { text: "CSES — Dynamic Programming", url: "https://cses.fi/problemset/list/" }
    ],
    videos: [
      { text: "DP for Beginners — Errichto (full series)", url: "https://www.youtube.com/watch?v=YBSt1jYwVfU" },
      { text: "Dijkstra's Algorithm — William Fiset", url: "https://www.youtube.com/watch?v=pSqmAO-m7Lk" },
      { text: "Bitmask DP — Colin Galen", url: "https://www.youtube.com/watch?v=jqJ5s077OKo" },
      { text: "Binary Search on Answer — Luv", url: "https://www.youtube.com/watch?v=aLnwZUPU2LM" }
    ],
    topicLinks: [
      { topic: "DP", url: "https://cp-algorithms.com/dynamic_programming/divide-and-conquer-dp.html" },
      { topic: "Dijkstra", url: "https://cp-algorithms.com/graph/dijkstra.html" },
      { topic: "Combinatorics", url: "https://cp-algorithms.com/combinatorics/binomial-coefficients.html" },
      { topic: "LCA", url: "https://cp-algorithms.com/graph/lca.html" },
      { topic: "Sparse table", url: "https://cp-algorithms.com/data_structures/sparse-table.html" }
    ]
  },
  {
    id: 4,
    label: "1800 → 2000",
    color: "#ef4444",
    accent: "#dc2626",
    title: "Expert-level mastery",
    duration: "~6 weeks · C++",
    ratingFrom: 1800,
    ratingTo: 2000,
    coreTopics: ["Segment trees", "Fenwick tree (BIT)", "Digit DP", "SCC / Bridges", "Min-cut / Max-flow"],
    supportTopics: ["Persistent DS", "Sqrt decomposition", "Hashing", "Game theory", "Geometry (basic)"],
    tips: [
      "Segment trees with lazy propagation — table stakes",
      "Participate in every rated contest (2-3/week)",
      "Read top-rated C++ solutions after contests",
      "Mental game matters — -30 one round won't ruin the goal"
    ],
    weekday: "1 hard problem (1800-2100 rated)",
    weekend: "Live Div.1+2 or Div.2 — real contest pressure",
    switchNote: null,
    resources: [
      { text: "cp-algorithms — Segment Trees", url: "https://cp-algorithms.com/data_structures/segment_tree.html" },
      { text: "USACO Guide (Gold)", url: "https://usaco.guide/gold/" },
      { text: "CF Edu — Segment Tree", url: "https://codeforces.com/edu/course/2/lesson/4" }
    ],
    videos: [
      { text: "Segment Trees — Errichto", url: "https://www.youtube.com/watch?v=Tr-xEGoByFQ" },
      { text: "Fenwick Tree in 10 min — Colin Galen", url: "https://www.youtube.com/watch?v=RgITNht_f4Q" },
      { text: "SCC Tarjan's — William Fiset", url: "https://www.youtube.com/watch?v=wUgWX0nc4NY" },
      { text: "How to reach Expert — Errichto", url: "https://www.youtube.com/watch?v=bSdp2WeyuJY" }
    ],
    topicLinks: [
      { topic: "Segment trees", url: "https://cp-algorithms.com/data_structures/segment_tree.html" },
      { topic: "Fenwick tree", url: "https://cp-algorithms.com/data_structures/fenwick.html" },
      { topic: "SCC", url: "https://cp-algorithms.com/graph/strongly-connected-components.html" },
      { topic: "Max-flow", url: "https://cp-algorithms.com/graph/edmonds_karp.html" },
      { topic: "Game theory", url: "https://cp-algorithms.com/game_theory/sprague-grundy-nim.html" }
    ]
  }
];

// ─── Default State ─────────────────────────────────────────
const DEFAULT_STATE = {
  currentRating: 800,
  targetRating: 2000,
  startDate: new Date().toISOString().slice(0, 10),
  currentPhase: 0,
  // Consistency tracker: { "2026-05-01": { solved: 3, contest: false, studied: true } }
  dailyLog: {},
  // Weekly goals: array of { text, done }
  weeklyGoals: [],
  // Notes: array of { id, date, title, content, phase }
  notes: [],
  // Topic mastery: { "Implementation": 0-100 }
  topicMastery: {},
  // Contest log: array of { date, name, rank, ratingChange, newRating }
  contests: [],
  // Streak
  currentStreak: 0,
  longestStreak: 0
};

function loadState() {
  try {
    const saved = localStorage.getItem('cf_tracker_state');
    if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
  } catch(e) {}
  return { ...DEFAULT_STATE };
}

function saveState(state) {
  localStorage.setItem('cf_tracker_state', JSON.stringify(state));
}
