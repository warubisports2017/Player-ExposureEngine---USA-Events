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
}

const PrintHeader = ({ profile }: { profile: PlayerProfile }) => (
  <div className="hidden print:block border-b border-slate-800 mb-8 pb-6">
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

const AnalysisResultView: React.FC<Props> = ({ result, profile, onReset }) => {
  const [viewMode, setViewMode] = useState<'player' | 'coach'>('player');
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Defensive Coding: Ensure we have arrays even if API returns undefined
  const visibilityScores = result.visibilityScores || [];
  const keyRisks = result.keyRisks || [];
  const actionPlan = result.actionPlan || [];
  const keyStrengths = result.keyStrengths || [];
  const funnelAnalysis = result.funnelAnalysis || {
    stage: 'Evaluation', conversionRate: '0%', bottleneck: 'Unknown', advice: 'Review data'
  };
  const benchmarkAnalysis = result.benchmarkAnalysis || [];
  const readinessScore = result.readinessScore || {
    athletic: 50, technical: 50, tactical: 50, academic: 50, market: 50
  };

  // Sort visibility scores safely
  const sortedVisibility = [...visibilityScores].sort((a, b) => {
    const order = { 'D1': 5, 'D2': 4, 'D3': 3, 'NAIA': 2, 'JUCO': 1 };
    return order[b.level as keyof typeof order] - order[a.level as keyof typeof order];
  });
  
  // No longer reversing. D1 (index 0) will be at the top in Recharts Vertical Layout.
  const chartData = [...sortedVisibility];

  // Calculate top realistic level for Coach View summary
  const bestLevel = [...visibilityScores]
    .sort((a, b) => b.visibilityPercent - a.visibilityPercent)[0];

  // Helper for Impact Badges
  const getImpactBadge = (impact: string) => {
    switch(impact) {
      case 'High': 
        return { 
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', 
          icon: TrendingUp, 
          label: 'High Impact' 
        };
      case 'Medium': 
        return { 
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', 
          icon: Activity, 
          label: 'Med Impact' 
        };
      default: 
        return { 
          color: 'text-slate-400 bg-slate-800/50 border-slate-700/50', 
          icon: Minus, 
          label: 'Low Impact' 
        };
    }
  };

  // Helper for Probability Status
  const getProbabilityStatus = (score: number) => {
    if (score < 25) return { label: 'very low', color: '#ef4444', textClass: 'text-red-500' };
    if (score < 50) return { label: 'low', color: '#f97316', textClass: 'text-orange-500' };
    if (score < 75) return { label: 'medium', color: '#eab308', textClass: 'text-yellow-500' };
    return { label: 'high', color: '#10b981', textClass: 'text-emerald-500' };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReport = () => {
    // In a real app, this would trigger a backend email service
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
          className="text-slate-400 hover:text-white flex items-center text-sm transition-colors"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Form
        </button>

        <div className="bg-slate-900 p-1 rounded-lg border border-white/10 flex">
          <button
            type="button" 
            onClick={() => setViewMode('player')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'player' 
                ? 'bg-emerald-500 text-slate-900 shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Player View
          </button>
          <button
            type="button" 
            onClick={() => setViewMode('coach')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'coach' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
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
           <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 font-mono text-sm shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Name</span>
                    <span className="text-white font-bold">{profile.lastName}, {profile.firstName}</span>
                 </div>
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Class</span>
                    <span className="text-white">{profile.gradYear}</span>
                 </div>
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Position</span>
                    <span className="text-white">{profile.position} {profile.secondaryPositions.length > 0 && `(${profile.secondaryPositions[0]})`}</span>
                 </div>
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Citizenship</span>
                    <span className="text-white">{profile.citizenship || "N/A"}</span>
                 </div>
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Height</span>
                    <span className="text-white">{profile.height}</span>
                 </div>
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Dominant Foot</span>
                    <span className="text-white">{profile.dominantFoot}</span>
                 </div>
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">GPA</span>
                    <span className="text-white">{profile.academics.gpa}</span>
                 </div>
                 <div>
                    <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Primary Level</span>
                    <span className="text-blue-400 font-bold">{bestLevel?.level || "N/A"}</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
              <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center">
                 <Shield className="w-4 h-4 mr-2" /> Internal Scouting Note
              </h3>
              <p className="text-lg md:text-xl text-white font-medium leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic">
                 "{result.coachShortEvaluation || "Data insufficient for evaluation."}"
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                 <h3 className="text-white font-bold mb-4">Recruiting Visibility</h3>
                 <div className="space-y-4">
                    {sortedVisibility.map((item) => (
                      <div key={item.level} className="flex items-center justify-between">
                         <span className="text-slate-400 font-mono text-sm w-12">{item.level}</span>
                         <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.visibilityPercent > 50 ? 'bg-blue-500' : 'bg-slate-600'}`}
                              style={{ width: `${item.visibilityPercent}%` }}
                            ></div>
                         </div>
                         <span className="text-white font-mono text-sm w-8 text-right">{item.visibilityPercent}%</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                 <h3 className="text-white font-bold mb-4">Key Constraints</h3>
                 <ul className="space-y-3">
                    {keyRisks.map((risk, i) => (
                       <li key={i} className="flex items-start text-sm text-slate-300">
                          <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 shrink-0" />
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
          <div className="bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-400" />
              Executive Summary
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              {result.plainLanguageSummary}
            </p>
          </div>

          {/* Section 1: Visibility Radar & Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart: Readiness */}
            <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-400" />
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
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Recruiting Probabilities */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                   <Trophy className="w-5 h-5 mr-2 text-emerald-400" />
                   Recruiting Probabilities
                </h3>
                
                <div className="h-[200px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        dataKey="level" 
                        type="category" 
                        width={40} 
                        tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
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
                    const score = visibilityScores.find(v => v.level === lvl)?.visibilityPercent || 0;
                    const status = getProbabilityStatus(score);
                    return (
                       <div key={lvl} className="bg-slate-950/50 border border-white/5 rounded p-2 text-center">
                          <div className="text-white font-bold text-xs mb-0.5">{lvl}</div>
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
          <div className="bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-blue-500/20 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 opacity-50"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Reality Check: You vs The Market</h3>
                <p className="text-sm text-slate-400">Comparing your current profile against typical commits.</p>
              </div>
              
              {/* Custom Legend */}
              <div className="flex space-x-4 mt-4 md:mt-0 text-[10px] font-mono uppercase tracking-wider">
                <div className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></span>You</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-slate-200 rounded-sm mr-2"></span>D1 AVG</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-slate-700 rounded-sm mr-2"></span>D3 AVG</div>
              </div>
            </div>

            <div className="h-[300px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkAnalysis} barGap={8}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                   <YAxis hide domain={[0, 100]} />
                   <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                   />
                   <Bar dataKey="userScore" name="You" fill="#10b981" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="d1Average" name="D1 Average" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="d3Average" name="D3 Average" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {benchmarkAnalysis.map((metric, idx) => (
                  <div key={idx} className="bg-slate-950/50 p-4 rounded-lg border border-white/5">
                     <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">INSIGHT</h4>
                     <p className="text-xs text-slate-300 leading-relaxed">{metric.feedback}</p>
                  </div>
               ))}
            </div>
          </div>

          {/* Section 3: The Funnel & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Recruiting Funnel */}
             <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                   <Share2 className="w-5 h-5 mr-2 text-purple-400" />
                   Recruiting Funnel
                </h3>
                <div className="relative pt-4 pb-8 px-4">
                   <div className="absolute left-6 top-4 bottom-8 w-0.5 bg-slate-800"></div>
                   
                   <div className="relative mb-8 pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Invisible' ? 'bg-red-500 border-red-500' : 'bg-slate-900 border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Outreach</h4>
                      <p className="text-white font-bold">{profile.coachesContacted} Coaches Contacted</p>
                   </div>

                   <div className="relative mb-8 pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Conversation' ? 'bg-amber-500 border-amber-500' : 'bg-slate-900 border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Interest</h4>
                      <p className="text-white font-bold">{profile.responsesReceived} Replies ({funnelAnalysis.conversionRate})</p>
                   </div>

                   <div className="relative pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Closing' ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900 border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Results</h4>
                      <p className="text-white font-bold">{profile.offersReceived} Offers</p>
                   </div>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-lg">
                   <span className="text-xs font-bold text-purple-400 uppercase block mb-1">Funnel Diagnosis</span>
                   <p className="text-sm text-purple-100">{funnelAnalysis.advice}</p>
                </div>
             </div>

             {/* Constraints & Blockers */}
             <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                   <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                   Performance Constraints
                </h3>
                <div className="space-y-4">
                   {keyRisks.map((risk, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border flex items-start ${
                         risk.severity === 'High' 
                           ? 'bg-red-900/10 border-red-500/30' 
                           : risk.severity === 'Medium'
                           ? 'bg-amber-900/10 border-amber-500/30'
                           : 'bg-blue-900/10 border-blue-500/30'
                      }`}>
                         <div className={`mt-0.5 mr-3 shrink-0 ${
                            risk.severity === 'High' ? 'text-red-400' : risk.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                         }`}>
                            <AlertCircle className="w-5 h-5" />
                         </div>
                         <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                               risk.severity === 'High' ? 'text-red-400' : risk.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                            }`}>
                               {risk.severity === 'High' ? 'Critical Blocker' : risk.severity === 'Medium' ? 'Warning' : 'Optimization'}
                            </span>
                            <span className="text-xs font-bold text-slate-300 uppercase block mb-1">{risk.category}</span>
                            <p className="text-sm text-slate-300 leading-snug">{risk.message}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Section 4: 90 Day Game Plan */}
          <div className="bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-emerald-400" />
              90 Day Game Plan
            </h3>
            <div className="space-y-4">
              {actionPlan.map((item, index) => {
                 // Check if this is the Highlight Video item (logic: if index 0 and video is missing or responses low)
                 // Or we can just inspect the description, but let's assume item 0 is always the critical one based on prompt logic.
                 const isVideoAction = index === 0 && (!profile.videoLink || (profile.videoLink && funnelAnalysis.conversionRate.includes('0%')));
                 
                 // Apply highlighting if it's the critical video action
                 const isCritical = isVideoAction; 
                 
                 // Resolve Impact Badge styles
                 const impactConfig = getImpactBadge(item.impact);
                 const ImpactIcon = impactConfig.icon;

                 return (
                  <div key={index} className={`relative p-5 rounded-xl border flex flex-col sm:flex-row gap-4 sm:items-start transition-all ${
                     isCritical 
                     ? 'border-blue-500/50 border-dashed bg-blue-900/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                     : 'border-white/5 bg-slate-950/40 hover:border-slate-700'
                  }`}>
                    {isCritical && (
                       <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider animate-pulse">
                          Critical Action Item
                       </div>
                    )}
                    
                    {/* Timeframe Badge */}
                    <div className="flex items-center space-x-2 shrink-0 sm:w-32 mt-1">
                      <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isCritical ? 'text-blue-300' : 'text-slate-400'}`}>
                        {item.timeframe.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <p className={`text-sm md:text-base leading-relaxed ${isCritical ? 'text-blue-50 font-medium' : 'text-slate-200'}`}>
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
      <div className="mt-12 border-t border-white/5 pt-8 print:hidden">
         <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-white/10">
            <div className="mb-6 md:mb-0">
               <h3 className="text-lg font-bold text-white mb-2">Save Your Report</h3>
               <p className="text-sm text-slate-400">Download a PDF copy or email this analysis to yourself.</p>
            </div>
            <div className="flex space-x-4">
               <button 
                  onClick={handlePrint}
                  className="flex items-center px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors text-sm font-medium"
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
      <div className="mt-6 mb-12 border border-white/5 bg-gradient-to-r from-slate-900 to-slate-950 rounded-xl p-1 print:hidden">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-lg bg-slate-950/50 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
               <div className="p-3 bg-slate-900 rounded-lg border border-white/5 hidden sm:block">
                  <Globe className="w-6 h-6 text-emerald-500" />
               </div>
               <div>
                  <h4 className="text-white font-bold text-base mb-1">Warubi Sports Elite Pathways</h4>
                  <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                     Selective residential programs in Germany and UEFA coaching courses for those serious about the professional game.
                  </p>
               </div>
            </div>
            <a 
               href="https://warubisports.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className="shrink-0 text-xs font-bold text-slate-300 hover:text-white flex items-center transition-colors uppercase tracking-wider group"
            >
               Learn More <ArrowRight className="w-3 h-3 ml-1.5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </a>
         </div>
      </div>

      {/* EMAIL MODAL */}
      {showEmailModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-slide-up">
               <h3 className="text-xl font-bold text-white mb-2">Email Full Report</h3>
               <p className="text-sm text-slate-400 mb-6">Enter your email address to receive the full PDF analysis.</p>
               
               <input 
                  type="email" 
                  placeholder="player@example.com" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white mb-4 focus:border-emerald-500 focus:outline-none"
               />
               
               <div className="flex justify-end space-x-3">
                  <button 
                     onClick={() => setShowEmailModal(false)}
                     className="px-4 py-2 text-slate-400 hover:text-white text-sm"
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