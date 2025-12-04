import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, SeasonStat, ExposureEvent, Position, YouthLeague } from '../types';
import { LEAGUES, POSITIONS, ATHLETIC_RATINGS } from '../constants';
import { Plus, Trash2, ChevronRight, Video, History, Zap, Check, ChevronsUpDown, Lightbulb, ChevronDown, User, GraduationCap } from 'lucide-react';

interface Props {
  onSubmit: (profile: PlayerProfile) => void;
  isLoading: boolean;
}

// Helper component for input labels
const Label = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">{children}</label>
);

// Helper for Section Headers
const SectionHeader = ({ step, title, icon: Icon }: { step: string, title: string, icon: any }) => (
  <div className="flex items-center mb-6 pb-4 border-b border-slate-200 dark:border-white/5">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mr-3 font-mono text-sm font-bold">
      {step}
    </div>
    <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
      {title}
      <Icon className="w-4 h-4 ml-2 text-slate-400 dark:text-slate-500" />
    </h3>
  </div>
);

const LeagueMultiSelect = ({ selected, onChange }: { selected: YouthLeague[], onChange: (leagues: YouthLeague[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLeague = (league: YouthLeague) => {
    if (selected.includes(league)) {
      onChange(selected.filter(l => l !== league));
    } else {
      onChange([...selected, league]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-lg p-2.5 text-sm text-left text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all hover:border-slate-400 dark:hover:border-slate-600 flex justify-between items-center group"
      >
        <span className="truncate block pr-6">
          {selected.length > 0 
            ? selected.map(l => l.replace(/_/g, ' ')).join(', ') 
            : <span className="text-slate-400 dark:text-slate-500">Select Leagues...</span>}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 absolute right-2.5" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {LEAGUES.map((league) => (
            <div
              key={league}
              onClick={() => toggleLeague(league)}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${selected.includes(league) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950'}`}>
                {selected.includes(league) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${selected.includes(league) ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                {league.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// DEMO DATA PRESETS (Kept same as provided)
const DEMO_PROFILES: Record<string, Partial<PlayerProfile>> = {
  "Blue Chip D1 (MLS NEXT)": {
    firstName: 'Alex', lastName: 'Romero', gender: 'Male', position: 'CM', gradYear: 2026,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 25, responsesReceived: 8, offersReceived: 1,
    academics: { graduationYear: 2026, gpa: 3.6, testScore: '1250 SAT' },
    athleticProfile: { speed: 'Elite', strength: 'Top_10_Percent', endurance: 'Elite', workRate: 'Elite', technical: 'Elite', tactical: 'Top_10_Percent' },
    seasons: [{ year: 2024, teamName: 'LA Galaxy Academy', league: ['MLS_NEXT'], minutesPlayedPercent: 90, mainRole: 'Key_Starter', goals: 8, assists: 12, honors: 'All-American' }]
  },
  "Solid Recruit (ECNL)": {
    firstName: 'Liam', lastName: 'Smith', gender: 'Male', position: 'CB', gradYear: 2026,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 15, responsesReceived: 2, offersReceived: 0,
    academics: { graduationYear: 2026, gpa: 3.2, testScore: '1100 SAT' },
    athleticProfile: { speed: 'Above_Average', strength: 'Top_10_Percent', endurance: 'Above_Average', workRate: 'Top_10_Percent', technical: 'Above_Average', tactical: 'Top_10_Percent' },
    seasons: [{ year: 2024, teamName: 'Mustang SC', league: ['ECNL'], minutesPlayedPercent: 85, mainRole: 'Key_Starter', goals: 3, assists: 1, honors: '1st Team All-Conference' }]
  },
  "High Academic D3 (ECNL RL)": {
    firstName: 'Emma', lastName: 'Davis', gender: 'Female', position: 'DM', gradYear: 2025,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 40, responsesReceived: 12, offersReceived: 2,
    academics: { graduationYear: 2025, gpa: 4.0, testScore: '1450 SAT' },
    athleticProfile: { speed: 'Average', strength: 'Average', endurance: 'Above_Average', workRate: 'Top_10_Percent', technical: 'Above_Average', tactical: 'Top_10_Percent' },
    seasons: [{ year: 2024, teamName: 'Crossfire', league: ['ECNL_RL'], minutesPlayedPercent: 95, mainRole: 'Key_Starter', goals: 2, assists: 6, honors: 'Scholar Athlete' }]
  },
  "D2/NAIA Target (NPL/USYS)": {
    firstName: 'Carlos', lastName: 'Mendez', gender: 'Male', position: 'WING', gradYear: 2026,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 10, responsesReceived: 1, offersReceived: 0,
    academics: { graduationYear: 2026, gpa: 2.8, testScore: '' },
    athleticProfile: { speed: 'Top_10_Percent', strength: 'Average', endurance: 'Above_Average', workRate: 'Above_Average', technical: 'Above_Average', tactical: 'Average' },
    seasons: [{ year: 2024, teamName: 'Local Club', league: ['Elite_Local'], minutesPlayedPercent: 80, mainRole: 'Key_Starter', goals: 12, assists: 4, honors: 'Team MVP' }]
  },
  "JUCO Route (Academic Risk)": {
    firstName: 'Jayden', lastName: 'Williams', gender: 'Male', position: '9', gradYear: 2025,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 5, responsesReceived: 0, offersReceived: 0,
    academics: { graduationYear: 2025, gpa: 2.1, testScore: '' },
    athleticProfile: { speed: 'Elite', strength: 'Elite', endurance: 'Average', workRate: 'Average', technical: 'Top_10_Percent', tactical: 'Above_Average' },
    seasons: [{ year: 2024, teamName: 'Top Academy', league: ['MLS_NEXT'], minutesPlayedPercent: 70, mainRole: 'Key_Starter', goals: 15, assists: 2, honors: 'Top Scorer' }]
  },
  "High School Star (No Club)": {
    firstName: 'Sarah', lastName: 'Johnson', gender: 'Female', position: 'AM', gradYear: 2026,
    experienceLevel: 'High_School_Varsity', videoLink: true, coachesContacted: 0, responsesReceived: 0, offersReceived: 0,
    academics: { graduationYear: 2026, gpa: 3.5, testScore: '1200' },
    athleticProfile: { speed: 'Top_10_Percent', strength: 'Average', endurance: 'Average', workRate: 'Average', technical: 'Top_10_Percent', tactical: 'Average' },
    seasons: [{ year: 2024, teamName: 'Lincoln High', league: ['High_School'], minutesPlayedPercent: 100, mainRole: 'Key_Starter', goals: 20, assists: 15, honors: 'State Player of Year' }]
  },
  "International / Semi-Pro": {
    firstName: 'Luka', lastName: 'Modric', gender: 'Male', position: 'CM', gradYear: 2024,
    experienceLevel: 'Semi_Pro_UPSL_NPSL_WPSL', videoLink: true, coachesContacted: 50, responsesReceived: 15, offersReceived: 3,
    academics: { graduationYear: 2024, gpa: 3.0, testScore: 'TOEFL Passed' },
    athleticProfile: { speed: 'Above_Average', strength: 'Top_10_Percent', endurance: 'Elite', workRate: 'Elite', technical: 'Elite', tactical: 'Elite' },
    seasons: [{ year: 2024, teamName: 'FC Berlin U19', league: ['Other'], minutesPlayedPercent: 85, mainRole: 'Key_Starter', goals: 5, assists: 10, honors: 'League XI' }]
  },
  "Bench Warmer (MLS NEXT)": {
    firstName: 'Ethan', lastName: 'Hunt', gender: 'Male', position: 'GK', gradYear: 2027,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 5, responsesReceived: 0, offersReceived: 0,
    academics: { graduationYear: 2027, gpa: 3.3, testScore: '' },
    athleticProfile: { speed: 'Average', strength: 'Average', endurance: 'Average', workRate: 'Average', technical: 'Average', tactical: 'Average' },
    seasons: [{ year: 2024, teamName: 'Big Club', league: ['MLS_NEXT'], minutesPlayedPercent: 10, mainRole: 'Bench', goals: 0, assists: 0, honors: '' }]
  },
  "The Ghost (No Video)": {
    firstName: 'Chris', lastName: 'Invisible', gender: 'Male', position: 'WB', gradYear: 2026,
    experienceLevel: 'Youth_Club_Only', videoLink: false, coachesContacted: 0, responsesReceived: 0, offersReceived: 0,
    academics: { graduationYear: 2026, gpa: 3.5, testScore: '' },
    athleticProfile: { speed: 'Elite', strength: 'Average', endurance: 'Top_10_Percent', workRate: 'Elite', technical: 'Above_Average', tactical: 'Average' },
    seasons: [{ year: 2024, teamName: 'ECNL Team', league: ['ECNL'], minutesPlayedPercent: 90, mainRole: 'Key_Starter', goals: 5, assists: 8, honors: '' }]
  },
  "Recreational / Beginner": {
    firstName: 'Sam', lastName: 'Rookie', gender: 'Male', position: 'Utility', gradYear: 2028,
    experienceLevel: 'Youth_Club_Only', videoLink: false, coachesContacted: 0, responsesReceived: 0, offersReceived: 0,
    academics: { graduationYear: 2028, gpa: 3.0, testScore: '' },
    athleticProfile: { speed: 'Below_Average', strength: 'Below_Average', endurance: 'Average', workRate: 'Average', technical: 'Below_Average', tactical: 'Below_Average' },
    seasons: [{ year: 2024, teamName: 'Town Rec', league: ['Other'], minutesPlayedPercent: 40, mainRole: 'Rotation', goals: 0, assists: 0, honors: '' }]
  }
};

const PlayerInputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  // Height state handled locally to allow ft/in inputs
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(10);
  
  // Demo Dropdown State
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  
  // Tip Rotation State
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  const loadingTips = [
    "Did you know? Over 70% of D1 scholarships are committed before senior year begins.",
    "Coaches spend an average of 3 minutes watching a highlight tape. The first 30 seconds are critical.",
    "D3 schools do not offer athletic scholarships, but 80% of D3 athletes receive academic aid.",
    "A 3.5+ GPA opens up 40% more roster spots than a 2.5 GPA.",
    "Personalized emails to coaches have a 5x higher response rate than generic blasts.",
    "There are over 1,200 colleges offering men's soccer, but only 205 are NCAA Division 1."
  ];

  // Rotate tips while loading
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Click outside listener for demo dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setIsDemoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial Empty State
  const [profile, setProfile] = useState<PlayerProfile>({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    citizenship: '',
    experienceLevel: 'Youth_Club_Only',
    position: 'CM',
    secondaryPositions: [],
    dominantFoot: 'Right',
    height: '5\'10"',
    gradYear: 2026,
    state: '',
    videoLink: false,
    coachesContacted: 0,
    responsesReceived: 0,
    offersReceived: 0,
    academics: {
      graduationYear: 2026,
      gpa: 3.0,
      testScore: ''
    },
    athleticProfile: {
      speed: 'Average',
      strength: 'Average',
      endurance: 'Average',
      workRate: 'Average',
      technical: 'Average',
      tactical: 'Average'
    },
    seasons: [
      {
        year: 2024,
        teamName: '',
        league: ['ECNL'],
        minutesPlayedPercent: 80,
        mainRole: 'Key_Starter',
        goals: 0,
        assists: 0,
        honors: ''
      }
    ],
    events: []
  });

  // Update height string whenever ft/in changes
  useEffect(() => {
    setProfile(prev => ({ ...prev, height: `${heightFt}'${heightIn}"` }));
  }, [heightFt, heightIn]);

  const handleInputChange = (field: keyof PlayerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAcademicChange = (field: keyof typeof profile.academics, value: any) => {
    setProfile(prev => ({
      ...prev,
      academics: { ...prev.academics, [field]: value }
    }));
  };

  const handleAthleticChange = (field: keyof typeof profile.athleticProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      athleticProfile: { ...prev.athleticProfile, [field]: value }
    }));
  };

  const toggleSecondaryPosition = (pos: Position) => {
    setProfile(prev => {
      const current = prev.secondaryPositions || [];
      if (current.includes(pos)) {
        return { ...prev, secondaryPositions: current.filter(p => p !== pos) };
      }
      if (current.length >= 2) return prev; // Max 2
      return { ...prev, secondaryPositions: [...current, pos] };
    });
  };

  const updateSeason = (index: number, field: keyof SeasonStat, value: any) => {
    const newSeasons = [...profile.seasons];
    // @ts-ignore
    newSeasons[index] = { ...newSeasons[index], [field]: value };
    setProfile(prev => ({ ...prev, seasons: newSeasons }));
  };

  const addSeason = () => {
    setProfile(prev => ({
      ...prev,
      seasons: [
        ...prev.seasons,
        {
          year: prev.seasons[prev.seasons.length - 1].year - 1,
          teamName: '',
          league: ['High_School'],
          minutesPlayedPercent: 50,
          mainRole: 'Rotation',
          goals: 0,
          assists: 0,
          honors: ''
        }
      ]
    }));
  };

  const removeSeason = (index: number) => {
    setProfile(prev => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== index)
    }));
  };

  const addEvent = () => {
    setProfile(prev => ({
      ...prev,
      events: [
        ...prev.events,
        { name: '', type: 'Showcase', collegesNoted: '' }
      ]
    }));
  };

  const updateEvent = (index: number, field: keyof ExposureEvent, value: any) => {
    const newEvents = [...profile.events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setProfile(prev => ({ ...prev, events: newEvents }));
  };

  const removeEvent = (index: number) => {
    setProfile(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index)
    }));
  };

  const fillDemoData = (key: string) => {
    const demoData = DEMO_PROFILES[key];
    if (!demoData) return;

    setHeightFt(5);
    setHeightIn(10);
    setProfile(prev => ({
      ...prev,
      ...demoData,
      state: 'California',
      citizenship: 'USA',
      dateOfBirth: '2007-06-15',
      secondaryPositions: [],
      events: [
        { name: 'Surf Cup', type: 'Showcase', collegesNoted: 'Local Colleges' }
      ]
    }));
    setIsDemoOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  // Calculate CM for display
  const heightCm = Math.round((heightFt * 30.48) + (heightIn * 2.54));

  const inputClass = "w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-400 dark:hover:border-slate-600";
  const selectClass = "w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      
      {/* Demo Button & Dropdown */}
      <div className="flex justify-end relative" ref={demoRef}>
        <button 
          type="button"
          onClick={() => setIsDemoOpen(!isDemoOpen)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
           <Zap className="w-3.5 h-3.5 text-emerald-500 group-hover:animate-pulse" />
           <span>Load Demo Profile</span>
           <ChevronDown className={`w-3 h-3 transition-transform ${isDemoOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDemoOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="py-1">
              {Object.keys(DEMO_PROFILES).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => fillDemoData(key)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: BASICS & ATHLETIC PROFILE */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-black/20">
        <SectionHeader step="01" title="Player Bio & Physical" icon={User} />
        
        {/* Row 1: Names & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label>First Name</Label>
            <input
              type="text"
              required
              className={inputClass}
              placeholder="e.g. John"
              value={profile.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <input
              type="text"
              required
              className={inputClass}
              placeholder="e.g. Doe"
              value={profile.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>
          <div>
            <Label>Gender</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('gender', 'Male')}
                className={`py-2.5 text-sm rounded-lg border transition-all ${
                  profile.gender === 'Male'
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-950/50 border-slate-300 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('gender', 'Female')}
                className={`py-2.5 text-sm rounded-lg border transition-all ${
                  profile.gender === 'Female'
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-950/50 border-slate-300 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                Female
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Grad Year, DOB, State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
           <div>
            <Label>HS Grad Year</Label>
            <input
              type="number"
              min={2024}
              max={2030}
              required
              className={`${inputClass} font-mono`}
              value={profile.gradYear || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                const newVal = isNaN(val) ? 0 : val;
                handleInputChange('gradYear', newVal);
                handleAcademicChange('graduationYear', newVal);
              }}
            />
          </div>
          <div>
            <Label>Date of Birth</Label>
             <input
              type="date"
              required
              className={`${inputClass} font-mono`}
              value={profile.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div>
            <Label>State / Region</Label>
            <input
              type="text"
              placeholder="e.g. SoCal, TX"
              required
              className={inputClass}
              value={profile.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          </div>
        </div>
        
        {/* Row 2.5: Citizenship & Maturity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div>
            <Label>Nationality / Citizenship</Label>
            <input
              type="text"
              placeholder="e.g. USA, Germany"
              className={inputClass}
              value={profile.citizenship}
              onChange={(e) => handleInputChange('citizenship', e.target.value)}
            />
          </div>
          <div>
            <Label>Adult / International Experience</Label>
             <div className="relative">
              <select
                className={selectClass}
                value={profile.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
              >
                <option value="Youth_Club_Only">Youth Club Only</option>
                <option value="High_School_Varsity">High School Varsity Only</option>
                <option value="Adult_Amateur_League">Adult Amateur / Sunday League</option>
                <option value="Semi_Pro_UPSL_NPSL_WPSL">Semi-Pro (UPSL, NPSL, WPSL, USL2)</option>
                <option value="International_Academy_U19">Intl Academy (U19/U17 Bundesliga, etc)</option>
                <option value="Pro_Academy_Reserve">Professional Academy / Reserve Team</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Height & Foot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>Height</Label>
            <div className="flex items-center space-x-2">
               <div className="relative flex-1">
                 <input 
                   type="number" min="4" max="7" 
                   value={heightFt} 
                   onChange={(e) => setHeightFt(parseInt(e.target.value) || 0)}
                   className={`${inputClass} pr-8`} 
                 />
                 <span className="absolute right-3 top-2.5 text-slate-500 text-xs font-mono">ft</span>
               </div>
               <div className="relative flex-1">
                 <input 
                   type="number" min="0" max="11" 
                   value={heightIn} 
                   onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                   className={`${inputClass} pr-8`} 
                 />
                 <span className="absolute right-3 top-2.5 text-slate-500 text-xs font-mono">in</span>
               </div>
               <div className="w-16 text-center">
                 <span className="text-xs text-slate-500 font-mono">({heightCm}cm)</span>
               </div>
            </div>
          </div>
          <div>
            <Label>Dominant Foot</Label>
            <div className="grid grid-cols-3 gap-2">
              {["Right", "Left", "Both"].map(foot => (
                <button
                  key={foot}
                  type="button"
                  onClick={() => handleInputChange('dominantFoot', foot)}
                  className={`py-2.5 text-sm rounded-lg border transition-all ${
                    profile.dominantFoot === foot
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-white dark:bg-slate-950/50 border-slate-300 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  {foot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Positions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Label>Primary Position</Label>
            <div className="relative">
              <select
                className={selectClass}
                value={profile.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
          <div>
             <Label>Secondary Positions (Max 2)</Label>
             <div className="flex flex-wrap gap-2 min-h-[42px] p-1.5 rounded-lg border border-slate-300 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-950/30">
                {POSITIONS.filter(p => p !== profile.position).map(p => {
                  const isSelected = profile.secondaryPositions.includes(p);
                  const isMax = profile.secondaryPositions.length >= 2;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={!isSelected && isMax}
                      onClick={() => toggleSecondaryPosition(p)}
                      className={`text-[10px] px-2 py-1 rounded transition-colors border ${
                        isSelected 
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      } ${!isSelected && isMax ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {p}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Row 5: Athletic Standards */}
        <div className="border-t border-slate-200 dark:border-white/5 pt-6">
           <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" />
              Player Ratings (vs. Teammates)
           </h4>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Speed (Accel / Top Speed)', key: 'speed' },
                { label: 'Strength / Physicality', key: 'strength' },
                { label: 'Endurance / Stamina', key: 'endurance' },
                { label: 'Work Rate / Intensity', key: 'workRate' },
                { label: 'Technical Ability', key: 'technical' },
                { label: 'Tactical Understanding', key: 'tactical' }
              ].map((attr) => (
                 <div key={attr.key}>
                    <Label>{attr.label}</Label>
                    <div className="relative">
                      <select
                        className={`${selectClass} text-xs py-2`}
                        value={profile.athleticProfile[attr.key as keyof typeof profile.athleticProfile]}
                        onChange={(e) => handleAthleticChange(attr.key as any, e.target.value)}
                      >
                        {ATHLETIC_RATINGS.map(r => (
                          <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">
                        <ChevronRight className="w-3 h-3 rotate-90" />
                      </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>

      {/* SECTION 2: ACADEMICS */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-black/20">
        <SectionHeader step="02" title="Academic Standing" icon={GraduationCap} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>GPA (Unweighted)</Label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                max="4.0"
                required
                className={`${inputClass} font-mono pl-3`}
                value={isNaN(profile.academics.gpa) ? '' : profile.academics.gpa}
                onChange={(e) => handleAcademicChange('gpa', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label>Test Score (Optional)</Label>
            <input
              type="text"
              placeholder="e.g. 1300 SAT"
              className={`${inputClass} font-mono`}
              value={profile.academics.testScore || ''}
              onChange={(e) => handleAcademicChange('testScore', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: SEASON HISTORY */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-black/20">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mr-3 font-mono text-sm font-bold">
              03
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
              Season History
              <History className="w-4 h-4 ml-2 text-slate-400 dark:text-slate-500" />
            </h3>
          </div>
          <button type="button" onClick={addSeason} className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center font-medium bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 transition-all hover:bg-emerald-200 dark:hover:bg-emerald-500/20">
            <Plus className="w-3 h-3 mr-1" /> Add Season
          </button>
        </div>
        
        <div className="space-y-6">
          {profile.seasons.map((season, idx) => (
            <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-white/5 relative group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removeSeason(idx)}
                  className="absolute top-3 right-3 text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                 <div>
                    <Label>Year</Label>
                    <input
                      type="number"
                      className={`${inputClass} py-1.5 font-mono text-center`}
                      value={isNaN(season.year) ? '' : season.year}
                      onChange={(e) => updateSeason(idx, 'year', parseInt(e.target.value))}
                    />
                 </div>
                 <div className="col-span-1 md:col-span-2">
                    <Label>Leagues (Select All)</Label>
                    <LeagueMultiSelect 
                      selected={season.league}
                      onChange={(leagues) => updateSeason(idx, 'league', leagues)}
                    />
                 </div>
                 <div>
                    <Label>Role</Label>
                    <select
                      className={`${inputClass} py-1.5`}
                      value={season.mainRole}
                      onChange={(e) => updateSeason(idx, 'mainRole', e.target.value)}
                    >
                      <option value="Key_Starter">Key Starter</option>
                      <option value="Rotation">Rotation</option>
                      <option value="Bench">Bench</option>
                      <option value="Injured">Injured</option>
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <Label>Minutes Played %</Label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        value={season.minutesPlayedPercent}
                        onChange={(e) => updateSeason(idx, 'minutesPlayedPercent', parseInt(e.target.value))}
                      />
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm w-12 text-right">{season.minutesPlayedPercent}%</span>
                    </div>
                 </div>
                 <div>
                    <Label>Team & Honors</Label>
                     <input
                      type="text"
                      placeholder="Team Name / Awards"
                      className={`${inputClass} py-1.5`}
                      value={season.honors}
                      onChange={(e) => updateSeason(idx, 'honors', e.target.value)}
                    />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: REALITY CHECK */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-black/20">
        <SectionHeader step="04" title="Market Reality" icon={Video} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
           {/* Video Toggle Card */}
           <div className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${profile.videoLink ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-500'}`}
                onClick={() => handleInputChange('videoLink', !profile.videoLink)}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center">
                  <Video className={`w-4 h-4 mr-2 ${profile.videoLink ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500'}`} />
                  Highlight Video
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${profile.videoLink ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${profile.videoLink ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {profile.videoLink 
                  ? "Great. Having accessible footage is the #1 requirement for remote recruiting." 
                  : "WARNING: Without video, your visibility score will be severely penalized."}
              </p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Coaches Emailed</Label>
                <input
                  type="number"
                  className={`${inputClass} font-mono`}
                  value={isNaN(profile.coachesContacted) ? 0 : profile.coachesContacted}
                  onChange={(e) => handleInputChange('coachesContacted', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Personal Replies</Label>
                <input
                  type="number"
                  className={`${inputClass} font-mono`}
                  value={isNaN(profile.responsesReceived) ? 0 : profile.responsesReceived}
                  onChange={(e) => handleInputChange('responsesReceived', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Concrete Offers</Label>
                <input
                  type="number"
                  className={`${inputClass} font-mono`}
                  value={isNaN(profile.offersReceived) ? 0 : profile.offersReceived}
                  onChange={(e) => handleInputChange('offersReceived', parseInt(e.target.value))}
                />
              </div>
           </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/5 pt-6">
          <div className="flex justify-between items-center mb-4">
             <Label>Showcase Events (Last 12 Months)</Label>
             <button type="button" onClick={addEvent} className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors">
                <Plus className="w-3 h-3 mr-1" /> Add Event
             </button>
          </div>
          
          <div className="space-y-3">
            {profile.events.length === 0 && (
             <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-dashed border-slate-300 dark:border-slate-700 text-center">
               <span className="text-xs text-slate-500">No events added.</span>
             </div>
            )}
            {profile.events.map((event, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-white/5">
                 <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input 
                      placeholder="Event Name" 
                      className={`${inputClass} py-1.5 text-xs bg-white dark:bg-slate-900 border-none`}
                      value={event.name}
                      onChange={(e) => updateEvent(idx, 'name', e.target.value)}
                    />
                    <select
                      className={`${inputClass} py-1.5 text-xs bg-white dark:bg-slate-900 border-none`}
                      value={event.type}
                      onChange={(e) => updateEvent(idx, 'type', e.target.value)}
                    >
                      <option value="Showcase">Showcase</option>
                      <option value="ID_Camp">ID Camp</option>
                      <option value="ODP">ODP / Select</option>
                      <option value="HS_Playoffs">HS Playoffs</option>
                    </select>
                    <input 
                      placeholder="Colleges Spoken To" 
                      className={`${inputClass} py-1.5 text-xs bg-white dark:bg-slate-900 border-none`}
                      value={event.collegesNoted}
                      onChange={(e) => updateEvent(idx, 'collegesNoted', e.target.value)}
                    />
                 </div>
                 <button onClick={() => removeEvent(idx)} className="text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-2 sm:self-center">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Section */}
      <div className="pt-4 pb-8">
        <div className={`relative p-2 rounded-2xl border-2 border-dashed transition-all duration-300 ${
           isLoading 
            ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/10' 
            : 'border-blue-300 dark:border-blue-500/30 hover:border-blue-400/50 bg-blue-50 dark:bg-blue-900/5'
        }`}>
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-6">
                  {/* Spinner */}
                  <div className="relative w-12 h-12 mb-4">
                      <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-2 animate-pulse">Analyzing Profile...</h4>
                  <div className="h-12 flex items-center justify-center w-full">
                    <p key={currentTipIndex} className="text-emerald-600 dark:text-emerald-400 text-xs md:text-sm text-center max-w-md px-4 font-medium animate-fade-in flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 mr-2 inline-block shrink-0" />
                        "{loadingTips[currentTipIndex]}"
                    </p>
                  </div>
               </div>
            ) : (
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 hover:shadow-lg hover:shadow-emerald-500/25 border border-emerald-400/50 transition-all transform active:scale-[0.99]"
                >
                  Calculate Visibility Score <ChevronRight className="ml-2 w-5 h-5" />
                </button>
            )}
        </div>
        
        {!isLoading && (
          <p className="text-center text-[10px] text-slate-500 mt-4 font-mono leading-tight max-w-md mx-auto">
            Powered by Warubi Sports Analytics.
          </p>
        )}
      </div>
    </form>
  );
};

export default PlayerInputForm;