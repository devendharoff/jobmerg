export interface ExtractedJDKeywords {
  found: string[];
  missing: string[];
  priority: string[];
}

export interface JDAnalysisResult {
  extractedKeywords: ExtractedJDKeywords;
  currentMatchScore: number;
  projectedMatchScore: number;
  jobTitle: string;
}

const CONNECTOR_WORDS = new Set([
  'a', 'an', 'and', 'or', 'for', 'in', 'on', 'with', 'at', 'by', 'from', 'to', 'of', 'via', 'into', 'onto', 'over', 'under', 'through'
]);

const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
  'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // HR / Job Posting boilerplate words
  'ability', 'able', 'across', 'act', 'active', 'activities', 'addition', 'additional', 'advance', 'agile', 'alignment', 'along', 'also', 'always', 'ambitious', 'amendment', 'among', 'amount', 'analysis', 'and/or', 'annually', 'another', 'answers', 'anyone', 'anything', 'anywhere', 'applicant', 'applicants', 'application', 'apply', 'applying', 'approach', 'appropriate', 'area', 'areas', 'around', 'article', 'aspects', 'assist', 'assistance', 'assistant', 'associated', 'associate', 'attract', 'audience', 'available', 'background', 'benefits', 'best', 'better', 'beyond', 'bonus', 'both', 'bring', 'built', 'business', 'call', 'candidate', 'candidates', 'career', 'careers', 'center', 'chance', 'change', 'changes', 'clear', 'clients', 'close', 'closely', 'code', 'collaboration', 'collaborative', 'come', 'commit', 'committed', 'committee', 'communicate', 'communication', 'communications', 'company', 'company\'s', 'competitive', 'complete', 'complex', 'comply', 'component', 'components', 'computer', 'conduct', 'confidence', 'consider', 'consideration', 'content', 'continual', 'continue', 'continuously', 'contribution', 'contribute', 'control', 'core', 'corporate', 'cost', 'country', 'course', 'create', 'creating', 'creative', 'critical', 'culture', 'current', 'currently', 'customer', 'customers', 'daily', 'data', 'day', 'days', 'deal', 'deadline', 'deadlines', 'decision', 'decisions', 'define', 'degree', 'deliver', 'delivering', 'delivery', 'demonstrated', 'department', 'depend', 'description', 'design', 'desirable', 'desire', 'desired', 'detail', 'detailed', 'details', 'develop', 'developer', 'developing', 'development', 'different', 'direct', 'direction', 'directly', 'discussion', 'diverse', 'diversity', 'do', 'documentation', 'domain', 'drive', 'driven', 'due', 'duties', 'each', 'early', 'earth', 'easy', 'economic', 'education', 'educational', 'effective', 'effectively', 'efficiency', 'efficient', 'effort', 'efforts', 'either', 'element', 'elements', 'eligible', 'email', 'employ', 'employee', 'employees', 'employer', 'employment', 'enable', 'enabling', 'encourage', 'end', 'energy', 'engage', 'engagement', 'engine', 'engineer', 'engineering', 'engineers', 'enhance', 'enjoy', 'ensure', 'ensuring', 'enterprise', 'entire', 'environment', 'equal', 'equipment', 'equity', 'equivalent', 'essential', 'established', 'establishing', 'estimation', 'etc', 'evaluate', 'evaluating', 'evaluation', 'even', 'event', 'events', 'every', 'everyone', 'everything', 'evidence', 'exact', 'excellent', 'exceptional', 'exciting', 'executive', 'existing', 'expand', 'expansion', 'expect', 'expectations', 'expected', 'experience', 'experienced', 'experiences', 'expert', 'expertise', 'explore', 'extend', 'extended', 'external', 'extra', 'facility', 'fact', 'factor', 'failure', 'fair', 'family', 'fast', 'fast-paced', 'feature', 'features', 'field', 'final', 'financial', 'find', 'fine', 'first', 'fit', 'five', 'fix', 'flexibility', 'flexible', 'focus', 'focused', 'focusing', 'follow', 'following', 'form', 'formal', 'forward', 'foster', 'found', 'foundation', 'four', 'framework', 'free', 'fresh', 'front', 'full', 'full-time', 'fully', 'fun', 'function', 'functional', 'functions', 'fund', 'fundamental', 'funding', 'future', 'gain', 'general', 'generate', 'generous', 'get', 'given', 'giving', 'global', 'goal', 'goals', 'good', 'govern', 'governance', 'grade', 'great', 'group', 'growing', 'growth', 'guidance', 'guide', 'guidelines', 'hand', 'handle', 'handling', 'hands-on', 'happen', 'happy', 'hard', 'head', 'health', 'healthcare', 'healthy', 'help', 'helping', 'high', 'high-level', 'higher', 'highly', 'hire', 'hiring', 'history', 'hold', 'holder', 'holding', 'home', 'honest', 'hope', 'hospital', 'hours', 'house', 'housing', 'how', 'hub', 'human', 'hybrid', 'idea', 'ideas', 'identify', 'identifying', 'immediate', 'impact', 'impactful', 'implementation', 'implementing', 'importance', 'important', 'improve', 'improvement', 'in-person', 'include', 'includes', 'including', 'inclusive', 'income', 'incorporate', 'increase', 'increasing', 'incumbent', 'independent', 'independently', 'individual', 'individuals', 'industry', 'influence', 'influencing', 'info', 'information', 'infrastructure', 'initiative', 'initiatives', 'innovation', 'innovative', 'input', 'insight', 'insights', 'inspection', 'inspiration', 'inspire', 'insurance', 'ensure', 'integrate', 'integrated', 'integrating', 'integration', 'integrity', 'intellectual', 'intelligence', 'intend', 'intense', 'intensive', 'intent', 'interaction', 'interest', 'interested', 'interesting', 'internal', 'international', 'interview', 'into', 'introduce', 'introduction', 'invent', 'invest', 'investigate', 'investment', 'invite', 'involved', 'involvement', 'involving', 'issue', 'issues', 'item', 'items', 'job', 'join', 'joining', 'journal', 'journey', 'judgment', 'junior', 'keep', 'key', 'kind', 'kpi', 'kpis', 'know', 'knowledge', 'known', 'lab', 'lack', 'language', 'languages', 'large', 'large-scale', 'last', 'late', 'latest', 'launch', 'lead', 'leader', 'leadership', 'leading', 'leads', 'learn', 'learning', 'least', 'leave', 'legacy', 'level', 'levels', 'life', 'lifelong', 'light', 'like', 'likely', 'limit', 'limited', 'line', 'link', 'list', 'live', 'living', 'local', 'location', 'locations', 'logic', 'logical', 'long', 'long-term', 'look', 'looking', 'lot', 'low', 'lower', 'made', 'main', 'maintain', 'maintaining', 'maintenance', 'major', 'majority', 'make', 'making', 'manage', 'managed', 'management', 'manager', 'managers', 'managing', 'mandatory', 'manner', 'many', 'market', 'matching', 'material', 'materials', 'matter', 'matters', 'max', 'maximize', 'maximum', 'may', 'mean', 'meaningful', 'means', 'measure', 'measures', 'mechanism', 'media', 'medical', 'meet', 'meeting', 'meetings', 'member', 'members', 'membership', 'mentoring', 'mentorship', 'merit', 'method', 'methodology', 'methods', 'metric', 'metrics', 'middle', 'might', 'mind', 'minimum', 'mission', 'mix', 'mobile', 'mode', 'model', 'modeling', 'models', 'modern', 'modification', 'mon', 'money', 'monitor', 'monitoring', 'month', 'monthly', 'months', 'more', 'most', 'mostly', 'motion', 'motivation', 'motive', 'move', 'movement', 'moving', 'much', 'multiple', 'must', 'mutual', 'name', 'national', 'native', 'natural', 'nature', 'near', 'necessary', 'need', 'needed', 'needs', 'net', 'network', 'networking', 'networks', 'never', 'new', 'news', 'next', 'nice', 'night', 'nine', 'nocr', 'non', 'none', 'nor', 'normal', 'norm', 'north', 'note', 'notes', 'nothing', 'notice', 'notification', 'number', 'numbers', 'numerous', 'object', 'objective', 'objectives', 'obligation', 'observation', 'observe', 'obtain', 'obvious', 'occasionally', 'occupational', 'occur', 'offer', 'offered', 'offering', 'offerings', 'offers', 'office', 'officer', 'offices', 'official', 'offline', 'offset', 'often', 'old', 'on-boarding', 'on-site', 'ongoing', 'online', 'open', 'opening', 'openings', 'operate', 'operating', 'operation', 'operational', 'operations', 'operator', 'opinion', 'opportunity', 'opportunities', 'optimal', 'optimization', 'optimize', 'optimizing', 'option', 'optional', 'options', 'order', 'orders', 'organization', 'organizational', 'organizations', 'organize', 'organized', 'organizing', 'orientation', 'origin', 'original', 'other', 'others', 'otherwise', 'our', 'ours', 'out', 'outcome', 'outcomes', 'output', 'outside', 'outstanding', 'overall', 'overnight', 'overseas', 'oversight', 'overview', 'own', 'owner', 'ownership', 'pace', 'package', 'packages', 'page', 'paid', 'pair', 'panel', 'paper', 'part', 'partial', 'participant', 'participate', 'participating', 'participation', 'particular', 'particularly', 'partner', 'partners', 'partnership', 'partnerships', 'party', 'pass', 'passion', 'passionate', 'past', 'path', 'pathway', 'patient', 'patients', 'pattern', 'pay', 'payment', 'pension', 'people', 'per', 'percent', 'percentage', 'perfect', 'perform', 'performance', 'performed', 'performing', 'period', 'person', 'personal', 'personality', 'personnel', 'persons', 'perspective', 'phone', 'physical', 'place', 'placement', 'plan', 'planning', 'plans', 'platform', 'platforms', 'play', 'player', 'please', 'point', 'points', 'policies', 'policy', 'portfolio', 'position', 'positions', 'positive', 'possess', 'possession', 'possibility', 'possible', 'post', 'posting', 'potential', 'practical', 'practice', 'practices', 'practitioner', 'pre-employment', 'predict', 'preference', 'preferences', 'preferred', 'preparation', 'prepare', 'preparing', 'presence', 'present', 'presentation', 'presentations', 'presented', 'presenting', 'preserve', 'preservation', 'president', 'press', 'pressure', 'pressures', 'prevail', 'prevent', 'previous', 'price', 'pricing', 'primary', 'prime', 'principle', 'principles', 'prior', 'priorities', 'prioritization', 'prioritize', 'priority', 'privacy', 'private', 'proactive', 'proactively', 'problem', 'problem-solving', 'problems', 'procedure', 'procedures', 'process', 'processes', 'processing', 'produce', 'product', 'production', 'products', 'profession', 'professional', 'professionals', 'proficiency', 'proficient', 'profile', 'program', 'programmatic', 'programme', 'programming', 'programs', 'progress', 'progression', 'progressive', 'project', 'projects', 'promote', 'promoting', 'promotion', 'prompt', 'proof', 'proper', 'properly', 'property', 'proposal', 'propose', 'prospect', 'prospective', 'protect', 'protection', 'protocol', 'protocols', 'prototype', 'provide', 'provided', 'provider', 'providers', 'provides', 'providing', 'provision', 'public', 'publish', 'purpose', 'pursue', 'pursuit', 'push', 'put', 'qualification', 'qualifications', 'qualified', 'qualify', 'qualifying', 'quality', 'quantify', 'quantity', 'quarter', 'quarterly', 'question', 'questions', 'quick', 'quickly', 'range', 'rank', 'rapid', 'rapidly', 'rate', 'rates', 'rating', 'reach', 'reaching', 'read', 'readiness', 'reading', 'ready', 'real', 'real-time', 'realistic', 'reality', 'reason', 'reasonable', 'receive', 'receiving', 'recent', 'recently', 'recognition', 'recognize', 'recommend', 'recommendation', 'recommendations', 'record', 'records', 'recruitment', 'reduce', 'reducing', 'refer', 'referral', 'refined', 'reflect', 'regarding', 'regardless', 'region', 'regional', 'regular', 'regularly', 'regulate', 'regulation', 'regulations', 'regulatory', 'reinforce', 'related', 'relation', 'relational', 'relations', 'relationship', 'relationships', 'relative', 'release', 'releases', 'relevance', 'relevant', 'reliable', 'reliability', 'relief', 'remain', 'remains', 'remote', 'removal', 'remove', 'remuneration', 'render', 'renew', 'renewal', 'report', 'reporting', 'reports', 'represent', 'representation', 'representative', 'reputation', 'request', 'requests', 'require', 'required', 'requirement', 'requirements', 'requires', 'research', 'resolution', 'resolve', 'resource', 'resources', 'respect', 'respond', 'response', 'responsibilities', 'responsibility', 'responsible', 'responsive', 'rest', 'result', 'resulting', 'results', 'resume', 'retail', 'retain', 'retention', 'retire', 'retirement', 'return', 'returns', 'review', 'reviewing', 'reviews', 'reward', 'rewards', 'rich', 'right', 'rigorous', 'risk', 'risks', 'road', 'roadmap', 'robust', 'role', 'roles', 'room', 'root', 'rough', 'route', 'routine', 'rule', 'rules', 'run', 'running', 'safe', 'safety', 'salary', 'sale', 'sales', 'same', 'sample', 'sample-based', 'satisfaction', 'save', 'saving', 'scale', 'scaling', 'schedule', 'scheduling', 'scheme', 'scholarly', 'school', 'science', 'scientific', 'scope', 'score', 'screen', 'screening', 'search', 'seat', 'second', 'secondary', 'secret', 'section', 'sector', 'sectors', 'secure', 'securing', 'security', 'see', 'seek', 'seeking', 'seeks', 'seem', 'seen', 'select', 'selected', 'selecting', 'selection', 'self', 'self-starter', 'sell', 'sending', 'senior', 'sense', 'sensitive', 'sensitivity', 'sensor', 'sent', 'separate', 'sequence', 'series', 'serve', 'service', 'services', 'serving', 'session', 'set', 'sets', 'setting', 'settings', 'settle', 'seven', 'several', 'shall', 'shape', 'share', 'shared', 'shareholder', 'sharing', 'shift', 'ship', 'shipping', 'short', 'shot', 'should', 'show', 'showing', 'shows', 'side', 'sign', 'signal', 'signature', 'significance', 'significant', 'signing', 'similar', 'simple', 'simplify', 'simultaneously', 'since', 'single', 'site', 'sites', 'situation', 'situations', 'six', 'size', 'skill', 'skilled', 'skills', 'small', 'smart', 'smooth', 'social', 'society', 'software', 'sole', 'solution', 'solutions', 'solve', 'solving', 'some', 'someone', 'something', 'sometimes', 'somewhere', 'soon', 'sophisticated', 'sort', 'sought', 'sound', 'source', 'sources', 'space', 'special', 'specialist', 'specialize', 'specialized', 'specific', 'specification', 'specifications', 'specified', 'specify', 'speed', 'spend', 'spending', 'spoken', 'sponsor', 'sponsorship', 'sports', 'spot', 'spread', 'stability', 'stable', 'staff', 'staffing', 'stage', 'stakeholder', 'stakeholders', 'standard', 'standards', 'standing', 'standout', 'start', 'started', 'starting', 'state', 'statement', 'statements', 'states', 'statutory', 'stay', 'step', 'steps', 'stick', 'still', 'stock', 'stop', 'storage', 'store', 'story', 'strategic', 'strategically', 'strategies', 'strategy', 'stream', 'streamline', 'street', 'strength', 'strengths', 'stress', 'strict', 'strike', 'strive', 'striving', 'strong', 'strongly', 'structural', 'structure', 'structured', 'student', 'students', 'studies', 'study', 'style', 'subject', 'submitting', 'subsequent', 'substance', 'substantial', 'succeed', 'success', 'successful', 'successfully', 'such', 'suggest', 'suitable', 'summary', 'summer', 'supervise', 'supervising', 'supervision', 'supervisor', 'supervisory', 'supplement', 'supplier', 'suppliers', 'supply', 'support', 'supported', 'supporting', 'supportive', 'supports', 'supposed', 'sure', 'surface', 'surgery', 'surpass', 'surprise', 'surrounding', 'survey', 'surveying', 'sustainable', 'system', 'systematic', 'systems', 'table', 'tackle', 'tactical', 'take', 'taking', 'talent', 'talented', 'talk', 'target', 'targeted', 'targets', 'task', 'tasks', 'taught', 'teach', 'teaching', 'team', 'teams', 'teamwork', 'tech', 'technical', 'technician', 'technologies', 'technology', 'tell', 'template', 'temporary', 'ten', 'term', 'terms', 'test', 'testing', 'tests', 'text', 'than', 'thank', 'thanks', 'that', 'their', 'them', 'themselves', 'then', 'there', 'thereof', 'these', 'they', 'thick', 'thing', 'things', 'think', 'thinking', 'third', 'this', 'thorough', 'thoroughly', 'those', 'though', 'thought', 'thousand', 'threat', 'three', 'thrive', 'thriving', 'through', 'throughout', 'ticket', 'tight', 'time', 'timely', 'times', 'timetable', 'timing', 'title', 'today', 'together', 'too', 'tool', 'tools', 'top', 'topic', 'total', 'touch', 'tour', 'towards', 'track', 'tracking', 'trade', 'train', 'trained', 'trainer', 'training', 'transform', 'transformation', 'transition', 'translate', 'translation', 'transport', 'travel', 'trend', 'trends', 'trial', 'trigger', 'trip', 'troubleshoot', 'troubleshooting', 'true', 'truly', 'trust', 'truth', 'try', 'tuition', 'turn', 'turnover', 'tutor', 'twenty', 'two', 'type', 'types', 'typical', 'typically', 'ultimate', 'ultimately', 'unable', 'unclear', 'under', 'undergraduate', 'understand', 'understanding', 'understands', 'understood', 'undertake', 'undertaking', 'unexpected', 'uniform', 'unique', 'unit', 'units', 'universal', 'university', 'unknown', 'unless', 'unlimited', 'unlock', 'unnecessary', 'unprecedented', 'unqualified', 'unstructured', 'until', 'unusual', 'up', 'update', 'updates', 'updating', 'upgrade', 'upon', 'upper', 'upside', 'uptake', 'upward', 'urban', 'urge', 'urgent', 'urgently', 'usable', 'usage', 'use', 'used', 'useful', 'user', 'users', 'uses', 'using', 'usual', 'usually', 'utility', 'utilize', 'utilized', 'utilizing', 'vacancies', 'vacancy', 'vacation', 'valid', 'validate', 'validation', 'validity', 'valuable', 'valuation', 'value', 'values', 'variable', 'variant', 'variation', 'variety', 'various', 'vary', 'vast', 'vendor', 'vendors', 'venture', 'verbal', 'verification', 'verified', 'verify', 'verifying', 'version', 'vertical', 'very', 'viable', 'vice', 'victim', 'video', 'view', 'viewing', 'views', 'virtual', 'virtually', 'virtue', 'vision', 'visit', 'visitor', 'visitors', 'visual', 'visualization', 'vital', 'vocal', 'voice', 'volume', 'voluntary', 'volunteer', 'vote', 'wage', 'wages', 'wait', 'waiver', 'walk', 'wall', 'want', 'wanted', 'wants', 'warn', 'warning', 'warrant', 'warranty', 'watch', 'water', 'wave', 'way', 'ways', 'weakness', 'wealth', 'wear', 'weather', 'web', 'website', 'week', 'weekly', 'weeks', 'weigh', 'weight', 'welcome', 'welfare', 'well', 'well-being', 'well-defined', 'well-known', 'went', 'were', 'what', 'whatever', 'wheel', 'when', 'whenever', 'where', 'whereas', 'wherever', 'whether', 'which', 'while', 'white', 'who', 'whoever', 'whole', 'whom', 'whose', 'wide', 'widely', 'wider', 'wild', 'will', 'willing', 'willingness', 'win', 'winning', 'wipe', 'wire', 'wisdom', 'wish', 'wishes', 'with', 'within', 'without', 'woman', 'women', 'wonder', 'wonderful', 'word', 'words', 'work', 'work-life', 'worked', 'worker', 'workers', 'workflow', 'workflows', 'workforce', 'working', 'workplace', 'works', 'workshop', 'workshops', 'world', 'worldwide', 'worth', 'would', 'write', 'writer', 'writing', 'written', 'wrong', 'wrote', 'yard', 'year', 'years', 'yield', 'you', 'young', 'your', 'yourself', 'youth', 'zone'
]);

export function extractKeywordsFromJD(
  jobDescription: string,
  candidateResumeText: string = '',
  candidateSkillsList: string[] = []
): JDAnalysisResult {
  if (!jobDescription || jobDescription.trim().length < 20) {
    return {
      extractedKeywords: { found: [], missing: [], priority: [] },
      currentMatchScore: 0,
      projectedMatchScore: 0,
      jobTitle: 'Target Role'
    };
  }

  const jdText = jobDescription.trim();
  const jdLower = jdText.toLowerCase();

  // Normalize candidate profile text & skills
  const normalizedCandidateText = [
    candidateResumeText,
    ...(candidateSkillsList || [])
  ].join(' ').toLowerCase();

  // 1. DYNAMIC TERM FREQUENCY EXTRACTION FROM THIS SPECIFIC JD
  const tokenMatches = jdText.match(/\b[a-zA-Z0-9+#.-]{2,}\b/g) || [];
  const wordFrequencyMap = new Map<string, { raw: string; count: number }>();

  tokenMatches.forEach((token) => {
    const cleanToken = token.trim();
    const lowerToken = cleanToken.toLowerCase();

    const isSpecialShort = ['c++', 'c#', 'ai', 'ui', 'ux', 'qa', 'ip', 'it', '3d', '2d', 'ml', 'bi', 'r'].includes(lowerToken);

    if (!isSpecialShort && (cleanToken.length < 3 || /^\d+$/.test(cleanToken))) {
      return;
    }

    if (COMMON_STOP_WORDS.has(lowerToken)) {
      return;
    }

    const existing = wordFrequencyMap.get(lowerToken);
    if (existing) {
      existing.count += 1;
      if (/^[A-Z]/.test(cleanToken) && !/^[A-Z]/.test(existing.raw)) {
        existing.raw = cleanToken;
      }
    } else {
      wordFrequencyMap.set(lowerToken, { raw: cleanToken, count: 1 });
    }
  });

  // 2. EXTRACT DYNAMIC BIGRAMS & TRIGRAMS FROM THIS SPECIFIC JD
  const sentences = jdLower.split(/[.\n;:!?]/);
  const phraseFrequencyMap = new Map<string, { raw: string; count: number }>();

  sentences.forEach((sentence) => {
    const words = sentence.match(/\b[a-zA-Z0-9+#.-]{2,}\b/g) || [];
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i].trim();
      const w2 = words[i + 1].trim();

      if (!COMMON_STOP_WORDS.has(w1) && !COMMON_STOP_WORDS.has(w2) && !CONNECTOR_WORDS.has(w1) && !CONNECTOR_WORDS.has(w2) && !/^\d+$/.test(w1) && !/^\d+$/.test(w2)) {
        const bigram = `${w1} ${w2}`;
        const existing = phraseFrequencyMap.get(bigram);
        if (existing) {
          existing.count += 1;
        } else {
          const formatted = bigram.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          phraseFrequencyMap.set(bigram, { raw: formatted, count: 1 });
        }
      }

      // Check Trigrams
      if (i < words.length - 2) {
        const w3 = words[i + 2].trim();
        if (!COMMON_STOP_WORDS.has(w3) && !CONNECTOR_WORDS.has(w3) && !/^\d+$/.test(w3)) {
          const trigram = `${w1} ${w2} ${w3}`;
          const existing = phraseFrequencyMap.get(trigram);
          if (existing) {
            existing.count += 1;
          } else {
            const formatted = trigram.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            phraseFrequencyMap.set(trigram, { raw: formatted, count: 1 });
          }
        }
      }
    }
  });

  // 3. RANK EXTRACTED TERMS FROM THIS JD BY IMPORTANCE & FREQUENCY
  const candidateTerms: { term: string; raw: string; score: number }[] = [];

  // Add phrases first (higher weight)
  phraseFrequencyMap.forEach((val, phrase) => {
    if (val.count >= 1) {
      candidateTerms.push({
        term: phrase,
        raw: val.raw,
        score: val.count * 3
      });
    }
  });

  // Add unigrams
  wordFrequencyMap.forEach((val, word) => {
    candidateTerms.push({
      term: word,
      raw: val.raw,
      score: val.count * 1.5
    });
  });

  // Sort by score descending
  candidateTerms.sort((a, b) => b.score - a.score);

  const uniqueRankedTerms: { term: string; raw: string }[] = [];
  const seenTerms = new Set<string>();

  for (const item of candidateTerms) {
    if (seenTerms.has(item.term)) continue;

    let formattedRaw = item.raw;
    if (item.term.length <= 4 && !item.term.includes(' ')) {
      formattedRaw = item.term.toUpperCase();
    } else if (/^[a-z]/.test(formattedRaw)) {
      formattedRaw = formattedRaw.charAt(0).toUpperCase() + formattedRaw.slice(1);
    }

    seenTerms.add(item.term);
    uniqueRankedTerms.push({ term: item.term, raw: formattedRaw });

    if (uniqueRankedTerms.length >= 35) break;
  }

  // 4. FACTUAL CANDIDATE MATCHING
  const foundSet = new Set<string>();
  const missingSet = new Set<string>();

  uniqueRankedTerms.forEach(({ term, raw }) => {
    const isFound = normalizedCandidateText.includes(term) ||
      (candidateSkillsList || []).some(s => s.toLowerCase().includes(term) || term.includes(s.toLowerCase()));

    if (isFound) {
      foundSet.add(raw);
    } else {
      missingSet.add(raw);
    }
  });

  const found = Array.from(foundSet);
  const missing = Array.from(missingSet);
  const totalExtracted = found.length + missing.length;

  const currentMatchScore = totalExtracted > 0 ? Math.round((found.length / totalExtracted) * 100) : 45;
  const priority = missing.slice(0, 10);
  const projectedMatchScore = Math.min(98, currentMatchScore + Math.min(35, priority.length * 4));

  // Extract Job Title from top lines of the JD
  const lines = jdText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let jobTitle = 'Target Role';
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^[^a-zA-Z0-9]+/, '');
    if (firstLine.length >= 4 && firstLine.length <= 80 && !firstLine.toLowerCase().includes('about us') && !firstLine.toLowerCase().includes('job description')) {
      jobTitle = firstLine;
    } else if (lines.length > 1) {
      const secondLine = lines[1].replace(/^[^a-zA-Z0-9]+/, '');
      if (secondLine.length >= 4 && secondLine.length <= 80) {
        jobTitle = secondLine;
      }
    }
  }

  return {
    extractedKeywords: {
      found,
      missing,
      priority
    },
    currentMatchScore,
    projectedMatchScore,
    jobTitle
  };
}
