import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PlayerInputForm from './components/PlayerInputForm';
import AnalysisResultView from './components/AnalysisResult';
import { PlayerProfile, AnalysisResult } from './types';
import { analyzeExposure } from './services/geminiService';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Update HTML class when theme changes
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (error) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const handleFormSubmit = async (submittedProfile: PlayerProfile) => {
    setProfile(submittedProfile);
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeExposure(submittedProfile);
      setAnalysisResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Analysis Error Details:", err);
      let errorMessage = "Failed to analyze profile. Please check your API key and try again.";
      if (err instanceof Error) {
        errorMessage += ` (${err.message})`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setProfile(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative transition-colors duration-300">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none print:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      <Header toggleTheme={toggleTheme} isDark={theme === 'dark'} />
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center text-red-800 dark:text-red-200 text-sm backdrop-blur-sm">
             <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        {!analysisResult ? (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center mb-10">
               <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                 What level would a college <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500">coach put you at today?</span>
               </h2>
               <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                 Answer a few questions about your league, minutes, grades, and video to get an honest visibility score and 90 day plan.
               </p>
               
               <div className="mt-8 flex justify-center space-x-8 text-xs font-mono text-slate-500 uppercase tracking-widest">
                  <span>MLS NEXT</span>
                  <span className="text-slate-400 dark:text-slate-700">•</span>
                  <span>ECNL</span>
                  <span className="text-slate-400 dark:text-slate-700">•</span>
                  <span>GA</span>
               </div>
             </div>

             <PlayerInputForm onSubmit={handleFormSubmit} isLoading={isLoading} />

             {/* Credibility Section */}
             <div className="mt-24 border-t border-slate-200 dark:border-white/5 pt-12">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                    Powered by Warubi Sports
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Decade of Excellence. Global Reach.</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
                    Warubi Sports has spent more than 10 years helping players reach NCAA, NAIA, and JUCO programs, working with professional agents worldwide, developing players in a Bundesliga academy in Germany, and supporting coaches through UEFA coaching licenses.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
                    <div className="bg-white/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-center hover:bg-white dark:hover:bg-slate-900/60 transition-colors group shadow-sm">
                       <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                          <GraduationCap className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                       </div>
                       <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">1,000+</div>
                       <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">College & Semi-Pro Placements</div>
                    </div>
                     <div className="bg-white/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-center hover:bg-white dark:hover:bg-slate-900/60 transition-colors group shadow-sm">
                       <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                          <Users className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                       </div>
                       <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">500+</div>
                       <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Licensed Coaches Network</div>
                    </div>
                     <div className="bg-white/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-center hover:bg-white dark:hover:bg-slate-900/60 transition-colors group shadow-sm">
                       <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                          <ShieldCheck className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                       </div>
                       <div className="text-xl font-bold text-slate-900 dark:text-white mb-1 pt-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">TRUSTED</div>
                       <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5">FIFA Agents & Bundesliga Academies</div>
                    </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>Trusted by College Coaches</span>
                    <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>FIFA-Licensed Agents</span>
                    <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>UEFA Licensed Educators</span>
                </div>
             </div>

          </div>
        ) : (
          <AnalysisResultView result={analysisResult} profile={profile!} onReset={handleReset} isDark={theme === 'dark'} />
        )}
      </main>

      <footer className="relative z-10 py-8 text-center text-[10px] text-slate-500 dark:text-slate-600 font-mono print:hidden">
        <p>© {new Date().getFullYear()} ExposureEngine. Not affiliated with NCAA, MLS NEXT or ECNL.</p>
      </footer>
    </div>
  );
};

export default App;