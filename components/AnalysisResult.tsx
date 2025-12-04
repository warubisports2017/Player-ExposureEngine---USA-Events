import React, { useState } from 'react';
import { AnalysisResult, RiskFlag, ActionItem, PlayerProfile, BenchmarkMetric } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ReferenceLine, Legend
} from 'recharts';
import { 
  AlertTriangle, CheckCircle2, Calendar, ArrowRight, Shield, 
  Download, Mail, Printer, Share2, TrendingUp, Activity, Minus, 
  AlertCircle, Info, Zap, User, Target, Globe, Trophy
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  profile: PlayerProfile;
  onReset: () => void;
  isDark: boolean;
}

const PrintHeader = ({ profile }: { profile: PlayerProfile }) => (
  <div className="hidden print:block border-b border-slate-200 mb-8 pb-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Exposure<span className="text-emerald-600">Engine</span> Report</h1>
        <p className="text-sm text-slate-500 mt-1">Generated via Warubi Sports Analytics</p>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold text-slate-800">{profile.firstName} {profile.lastName}</h2>
        <p className="text-sm text-slate-500">Class of {profile.gradYear} • {profile.position}</p>
        <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  </div>
);

const AnalysisResultView: React.FC<Props> = ({ result, profile, onReset, isDark }) => {
  const [viewMode, setViewMode] = useState<'player' | 'coach'>('player');
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Defensive Coding: Ensure we have arrays even if API returns undefined
  const visibilityScores = result.visibilityScores || [];
  const keyRisks = result.keyRisks || [];
  const rawActionPlan = result.actionPlan || [];
  const keyStrengths = result.keyStrengths || [];
  const funnelAnalysis = result.funnelAnalysis || {
    stage: 'Evaluation', conversionRate: '0%', bottleneck: 'Unknown', advice: 'Review data'
  };
  const benchmarkAnalysis = result.benchmarkAnalysis || [];
  const readinessScore = result.readinessScore || {
    athletic: 50, technical: 50, tactical: 50, academic: 50, market: 50
  };

  // Helper to normalize level names (e.g. "NCAA D1" -> "D1") for consistent sorting and mapping
  const normalizeLevel = (level: string) => {
    if (!level) return '';
    return level.replace(/NCAA\s*/i, '').trim();
  };

  // Sort visibility scores safely
  const sortedVisibility = [...visibilityScores].sort((a, b) => {
    const order: Record<string, number> = { 'D1': 5, 'D2': 4, 'D3': 3, 'NAIA': 2, 'JUCO': 1 };
    const scoreA = order[normalizeLevel(a.level)] || 0;
    const scoreB = order[normalizeLevel(b.level)] || 0;
    return scoreB - scoreA;
  });
  
  // No longer reversing. D1 (index 0) will be at the top in Recharts Vertical Layout.
  const chartData = [...sortedVisibility];

  // Calculate top realistic level for Coach View summary
  const bestLevel = [...visibilityScores]
    .sort((a, b) => b.visibilityPercent - a.visibilityPercent)[0];

  // Logic to enforce Video Action Item presence
  const finalActionPlan = React.useMemo(() => {
    let plan = [...rawActionPlan];
    const videoKeywords = ['video', 'highlight', 'reel', 'film', 'footage'];
    const videoIndex = plan.findIndex(item => 
      videoKeywords.some(k => item.description.toLowerCase().includes(k))
    );

    if (videoIndex === -1) {
      // No video item found, inject one at the top
      const newVideoItem: ActionItem = {
        timeframe: 'Next_30_Days',
        impact: 'High',
        description: profile.videoLink 
          ? "Optimize your highlight video. Coaches spend 30s avg on a reel. Ensure your first 4 clips are undeniable 'Elite' moments. Remove fluff and music intros."
          : "URGENT: Create a highlight video. You cannot be recruited without one. Record your next 3 matches and produce a 3-5 minute reel immediately."
      };
      plan.unshift(newVideoItem);
    } else if (videoIndex > 0) {
      // Video item exists but isn't first, move to top to ensure priority
      const [item] = plan.splice(videoIndex, 1);
      plan.unshift(item);
    }
    
    return plan.slice(0, 5); // Ensure list doesn't get too long
  }, [rawActionPlan, profile.videoLink]);

  // Helper for Impact Badges
  const getImpactBadge = (impact: string) => {
    switch(impact) {
      case 'High': 
        return { 
          color: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', 
          icon: TrendingUp, 
          label: 'High Impact' 
        };
      case 'Medium': 
        return { 
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', 
          icon: Activity, 
          label: 'Med Impact' 
        };
      default: 
        return { 
          color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50', 
          icon: Minus, 
          label: 'Low Impact' 
        };
    }
  };

  // Helper for Probability Status
  const getProbabilityStatus = (score: number) => {
    if (score < 25) return { label: 'very low', color: '#ef4444', textClass: 'text-red-500' };
    if (score < 50) return { label: 'low', color: '#f97316', textClass: 'text-orange-500' };
    if (score < 75) return { label: 'medium', color: '#eab308', textClass: 'text-yellow-600 dark:text-yellow-500' };
    return { label: 'high', color: '#10b981', textClass: 'text-emerald-600 dark:text-emerald-500' };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReport = () => {
    setTimeout(() => {
      setShowEmailModal(false);
      alert(`Report sent to ${profile.firstName}'s email address.`);
    }, 1000);
  };

  return (
    <div className="w-full animate-fade-in print:p-0">
      <PrintHeader profile={profile} />

      {/* VIEW TOGGLE SWITCH */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={onReset}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center text-sm transition-colors"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Form
        </button>

        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-white/10 flex">
          <button
            type="button" 
            onClick={() => setViewMode('player')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'player' 
                ? 'bg-emerald-500 text-slate-900 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Player View
          </button>
          <button
            type="button" 
            onClick={() => setViewMode('coach')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'coach' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Coach View
          </button>
        </div>
      </div>

      {viewMode === 'coach' ? (
        /* COACH VIEW - Brutally Honest Dashboard */
        <div className="space-y-6">
           {/* PLAYER BIO STATS - SCOUTING DB STYLE */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 font-mono text-sm shadow-xl dark:shadow-none">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Name</span>
                    <span className="text-slate-900 dark:text-white font-bold">{profile.lastName}, {profile.firstName}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Class</span>
                    <span className="text-slate-900 dark:text-white">{profile.gradYear}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Position</span>
                    <span className="text-slate-900 dark:text-white">{profile.position} {profile.secondaryPositions.length > 0 && `(${profile.secondaryPositions[0]})`}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Citizenship</span>
                    <span className="text-slate-900 dark:text-white">{profile.citizenship || "N/A"}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Height</span>
                    <span className="text-slate-900 dark:text-white">{profile.height}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Dominant Foot</span>
                    <span className="text-slate-900 dark:text-white">{profile.dominantFoot}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">GPA</span>
                    <span className="text-slate-900 dark:text-white">{profile.academics.gpa}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Primary Level</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{bestLevel?.level || "N/A"}</span>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-xl dark:shadow-none">
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center">
                 <Shield className="w-4 h-4 mr-2" /> Internal Scouting Note
              </h3>
              <p className="text-lg md:text-xl text-slate-900 dark:text-white font-medium leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic">
                 "{result.coachShortEvaluation || "Data insufficient for evaluation."}"
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
                 <h3 className="text-slate-900 dark:text-white font-bold mb-4">Recruiting Visibility</h3>
                 <div className="space-y-4">
                    {sortedVisibility.map((item) => (
                      <div key={item.level} className="flex items-center justify-between">
                         <span className="text-slate-500 dark:text-slate-400 font-mono text-sm w-12">{item.level}</span>
                         <div className="flex-1 mx-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.visibilityPercent > 50 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                              style={{ width: `${item.visibilityPercent}%` }}
                            ></div>
                         </div>
                         <span className="text-slate-900 dark:text-white font-mono text-sm w-8 text-right">{item.visibilityPercent}%</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
                 <h3 className="text-slate-900 dark:text-white font-bold mb-4">Key Constraints</h3>
                 <ul className="space-y-3">
                    {keyRisks.map((risk, i) => (
                       <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-2 mt-0.5 shrink-0" />
                          <span>{risk.message}</span>
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      ) : (
        /* PLAYER VIEW - Detailed Analysis */
        <div className="space-y-6">
          
          {/* Executive Summary */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
              Executive Summary
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              {result.plainLanguageSummary}
            </p>
          </div>

          {/* Section 1: Visibility Radar & Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart: Readiness */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                Player Readiness
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                    { subject: 'Athletic', A: readinessScore.athletic, fullMark: 100 },
                    { subject: 'Technical', A: readinessScore.technical, fullMark: 100 },
                    { subject: 'Market', A: readinessScore.market, fullMark: 100 },
                    { subject: 'Academic', A: readinessScore.academic, fullMark: 100 },
                    { subject: 'Tactical', A: readinessScore.tactical, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 text-center leading-relaxed">
                * Analysis based on self-reported ratings relative to current league level. Not independently verified.
              </p>
            </div>

            {/* Bar Chart: Recruiting Probabilities */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                   <Trophy className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                   Recruiting Probabilities
                </h3>
                
                <div className="h-[200px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        dataKey="level" 
                        type="category" 
                        width={60} 
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ 
                          backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          color: isDark ? '#f1f5f9' : '#0f172a'
                        }}
                        itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                      />
                      <Bar dataKey="visibilityPercent" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getProbabilityStatus(entry.visibilityPercent).color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Probability Grid */}
              <div className="grid grid-cols-5 gap-2 mt-2">
                 {['D1', 'D2', 'D3', 'NAIA', 'JUCO'].map((lvl) => {
                    const score = visibilityScores.find(v => normalizeLevel(v.level) === lvl)?.visibilityPercent || 0;
                    const status = getProbabilityStatus(score);
                    return (
                       <div key={lvl} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded p-2 text-center">
                          <div className="text-slate-900 dark:text-white font-bold text-xs mb-0.5">{lvl}</div>
                          <div className={`text-[10px] font-medium leading-tight ${status.textClass}`}>
                             {status.label}
                          </div>
                       </div>
                    );
                 })}
              </div>
            </div>
          </div>

          {/* Section 2: Reality Check (Benchmark Analysis) */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-lg dark:shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 opacity-50"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Reality Check: You vs The Market</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Comparing your current profile against typical commits.</p>
              </div>
              
              {/* Custom Legend */}
              <div className="flex space-x-6 mt-4 md:mt-0 text-[10px] font-mono uppercase tracking-wider justify-end">
                <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></span>You</div>
                <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-8 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-slate-200 mr-2"></span>D1 AVG</div>
                <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-8 h-0.5 border-t-2 border-dashed border-slate-900 dark:border-slate-600 mr-2"></span>D3 AVG</div>
              </div>
            </div>

            <div className="flex justify-around items-end h-[280px] w-full mb-8 px-2 md:px-12 pt-8 pb-2">
               {benchmarkAnalysis.map((metric, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full w-1/3 max-w-[120px] group relative">
                     {/* The Track */}
                     <div className="relative w-full flex-1 bg-slate-100 dark:bg-slate-950 rounded-t-lg border-x border-t border-slate-200 dark:border-white/5 overflow-visible">
                        
                        {/* Grid lines (optional aesthetic) */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(0deg,transparent_24%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_76%,transparent_77%,transparent)] dark:bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,0.3)_25%,rgba(255,255,255,0.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,0.3)_75%,rgba(255,255,255,0.3)_76%,transparent_77%,transparent)] bg-[length:100%_20px]"></div>

                        {/* User Bar */}
                        <div 
                           className="absolute bottom-0 left-2 right-2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                           style={{ height: `${metric.userScore}%` }}
                        >
                           {/* Score Tooltip/Label */}
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              {metric.userScore}
                           </div>
                        </div>

                        {/* D3 Marker */}
                        <div 
                           className="absolute w-full border-t-2 border-dashed border-slate-900 dark:border-slate-600 left-0"
                           style={{ bottom: `${metric.d3Average}%` }}
                        >
                           <span className="absolute right-0 -top-3 text-[9px] font-mono text-slate-900 dark:text-slate-500 font-bold bg-white/80 dark:bg-slate-900/80 px-1">D3</span>
                        </div>

                        {/* D1 Marker */}
                        <div 
                           className="absolute w-full border-t-2 border-dashed border-slate-400 dark:border-slate-200 left-0"
                           style={{ bottom: `${metric.d1Average}%` }}
                        >
                           <span className="absolute right-0 -top-3 text-[9px] font-mono text-slate-500 dark:text-slate-200 font-bold bg-white/80 dark:bg-slate-900/80 px-1">D1</span>
                        </div>
                     </div>
                     
                     {/* Category Label */}
                     <div className="mt-4 text-center">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">{metric.category}</span>
                     </div>
                  </div>
               ))}
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {benchmarkAnalysis.map((metric, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-white/5">
                     <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">INSIGHT</h4>
                     <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{metric.feedback}</p>
                  </div>
               ))}
            </div>
          </div>

          {/* Section 3: The Funnel & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Recruiting Funnel */}
             <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                   <Share2 className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                   Recruiting Funnel
                </h3>
                <div className="relative pt-4 pb-8 px-4">
                   <div className="absolute left-6 top-4 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                   
                   <div className="relative mb-8 pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Invisible' ? 'bg-red-500 border-red-500' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Outreach</h4>
                      <p className="text-slate-900 dark:text-white font-bold">{profile.coachesContacted} Coaches Contacted</p>
                   </div>

                   <div className="relative mb-8 pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Conversation' ? 'bg-amber-500 border-amber-500' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Interest</h4>
                      <p className="text-slate-900 dark:text-white font-bold">{profile.responsesReceived} Replies ({funnelAnalysis.conversionRate})</p>
                   </div>

                   <div className="relative pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Closing' ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Results</h4>
                      <p className="text-slate-900 dark:text-white font-bold">{profile.offersReceived} Offers</p>
                   </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 p-4 rounded-lg">
                   <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase block mb-1">Funnel Diagnosis</span>
                   <p className="text-sm text-purple-900 dark:text-purple-100">{funnelAnalysis.advice}</p>
                </div>
             </div>

             {/* Constraints & Blockers */}
             <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                   <AlertTriangle className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" />
                   Performance Constraints
                </h3>
                <div className="space-y-4">
                   {keyRisks.map((risk, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border flex items-start ${
                         risk.severity === 'High' 
                           ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30' 
                           : risk.severity === 'Medium'
                           ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/30'
                           : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/30'
                      }`}>
                         <div className={`mt-0.5 mr-3 shrink-0 ${
                            risk.severity === 'High' ? 'text-red-600 dark:text-red-400' : risk.severity === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                         }`}>
                            <AlertCircle className="w-5 h-5" />
                         </div>
                         <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                               risk.severity === 'High' ? 'text-red-600 dark:text-red-400' : risk.severity === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                               {risk.severity === 'High' ? 'Critical Blocker' : risk.severity === 'Medium' ? 'Warning' : 'Optimization'}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">{risk.category}</span>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{risk.message}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Section 4: 90 Day Game Plan */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-emerald-500 dark:text-emerald-400" />
              90 Day Game Plan
            </h3>
            <div className="space-y-4">
              {finalActionPlan.map((item, index) => {
                 // Determine if this is the Video Action Item by checking keywords
                 // Logic updated to be content-aware rather than index-dependent
                 const videoKeywords = ['video', 'highlight', 'reel', 'film', 'footage'];
                 const isVideoAction = videoKeywords.some(k => item.description.toLowerCase().includes(k));
                 
                 // Apply highlighting if it's a video action
                 const isCritical = isVideoAction; 
                 
                 // Resolve Impact Badge styles
                 const impactConfig = getImpactBadge(item.impact);
                 const ImpactIcon = impactConfig.icon;

                 return (
                  <div key={index} className={`relative p-5 rounded-xl border flex flex-col sm:flex-row gap-4 sm:items-start transition-all ${
                     isCritical 
                     ? 'border-blue-400/50 dark:border-blue-500/50 border-dashed bg-blue-50 dark:bg-blue-900/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                     : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}>
                    {isCritical && (
                       <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider animate-pulse">
                          Critical Action Item
                       </div>
                    )}
                    
                    {/* Timeframe Badge */}
                    <div className="flex items-center space-x-2 shrink-0 sm:w-32 mt-1">
                      <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isCritical ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.timeframe.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <p className={`text-sm md:text-base leading-relaxed ${isCritical ? 'text-blue-900 dark:text-blue-50 font-medium' : 'text-slate-700 dark:text-slate-200'}`}>
                        {item.description}
                      </p>
                    </div>

                    {/* Impact Badge */}
                    <div className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider self-start sm:self-center ${impactConfig.color}`}>
                       <ImpactIcon className="w-3.5 h-3.5" />
                       <span>{impactConfig.label}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAKE ACTION FOOTER (PDF & EMAIL) */}
      <div className="mt-12 border-t border-slate-200 dark:border-white/5 pt-8 print:hidden">
         <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-slate-300 dark:border-white/10">
            <div className="mb-6 md:mb-0">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Save Your Report</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400">Download a PDF copy or email this analysis to yourself.</p>
            </div>
            <div className="flex space-x-4">
               <button 
                  onClick={handlePrint}
                  className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 transition-colors text-sm font-medium shadow-sm"
               >
                  <Printer className="w-4 h-4 mr-2" />
                  Print / PDF
               </button>
               <button 
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-900/20"
               >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Report
               </button>
            </div>
         </div>
      </div>

      {/* WARUBI PATHWAYS CTA */}
      <div className="mt-12 mb-12 relative group cursor-pointer print:hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 text-emerald-400 mb-3">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold">International & Pro Level</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Warubi Sports Elite Pathways</h3>
              <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
                  Beyond analytics, we provide direct access to professional development. Exclusive residential academies in Germany, FIFA-licensed agency representation, and UEFA coaching education.
              </p>
            </div>
            
            <a 
              href="https://warubisports.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative z-10 shrink-0 flex items-center px-8 py-4 bg-white text-slate-950 hover:bg-emerald-50 rounded-xl font-bold text-sm transition-all transform group-hover:scale-105 shadow-xl shadow-emerald-900/20"
            >
              <span>Request Access</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
        </div>
      </div>

      {/* EMAIL MODAL */}
      {showEmailModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-slide-up">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email Full Report</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your email address to receive the full PDF analysis.</p>
               
               <input 
                  type="email" 
                  placeholder="player@example.com" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white mb-4 focus:border-emerald-500 focus:outline-none"
               />
               
               <div className="flex justify-end space-x-3">
                  <button 
                     onClick={() => setShowEmailModal(false)}
                     className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={handleEmailReport}
                     className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm"
                  >
                     Send Report
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default AnalysisResultView;