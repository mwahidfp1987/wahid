import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  BrainCircuit, 
  Save, 
  Trash2,
  TrendingUp,
  Activity,
  MessageCircle,
  Mail,
  Pencil, 
  X,
  Check,
  Briefcase,
  User as UserIcon,
  Lock,
  RefreshCw,
  LogOut,
  Users,
  Shield,
  FolderPlus,
  FileText,
  Search,
  Eye,
  Layers,
  Archive,
  ClipboardList,
  CalendarCheck,
  Share2,
  Send
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { ProjectData, Issue, IssueStatus, User, ProjectCategory, ProjectStatus } from './types';
import { StatCard } from './components/StatCard';
import { analyzeProjectReport } from './services/geminiService';

// --- Constants & Utilities ---
const COLORS = {
  OPEN: '#EF4444',       // Red-500
  IN_PROGRESS: '#F59E0B', // Amber-500
  CLOSED: '#10B981',      // Emerald-500
  PMO: '#6366f1',        // Indigo-500
  SDA: '#8b5cf6',        // Violet-500
};

const INITIAL_USERS: User[] = [
  { id: 'u2', username: 'user', password: '123', role: 'user' },
];

const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: 'proj_001',
    name: "E-Commerce Mobile App Revamp",
    owner: 'user',
    category: 'PMO',
    projectStatus: 'Progress',
    progress: 65,
    startDate: '2023-10-20',
    issues: [
      {
        id: '1',
        date: '2023-10-25',
        caseNumber: 'TC-001',
        testCase: 'Login Functionality',
        description: 'Login page crashes on iOS 14 devices',
        actualResult: 'App crashes immediately upon clicking login button',
        expectedResult: 'User should be redirected to dashboard',
        correction: 'Rolled back authentication library version',
        status: 'CLOSED',
        dateClosed: '2023-10-26'
      },
      {
        id: '2',
        date: '2023-10-26',
        caseNumber: 'TC-045',
        testCase: 'Checkout UI',
        description: 'Checkout button misaligned on small screens',
        actualResult: 'Button overlaps with footer',
        expectedResult: 'Button should be floating above footer',
        correction: 'Added responsive padding css',
        status: 'IN_PROGRESS',
      },
      {
        id: '3',
        date: '2023-10-27',
        caseNumber: 'TC-088',
        testCase: 'API Load Test',
        description: 'API timeout during high load',
        actualResult: '504 Gateway Timeout after 30s',
        expectedResult: 'Response within 200ms',
        status: 'OPEN',
      },
    ]
  },
  {
    id: 'proj_002',
    name: "Internal HR Portal v2",
    owner: 'user',
    category: 'SDA',
    projectStatus: 'Pengujian Done',
    progress: 90,
    startDate: '2023-11-01',
    issues: [
      {
        id: '101',
        date: '2023-11-01',
        caseNumber: 'TC-102',
        testCase: 'Employee Search',
        description: 'Employee search returns duplicate results',
        actualResult: 'Search for "John" returns 2 identical records',
        expectedResult: 'Should return unique records only',
        correction: 'Added distinct clause to query',
        status: 'CLOSED',
        dateClosed: '2023-11-02'
      },
      {
        id: '102',
        date: '2023-11-05',
        caseNumber: 'TC-205',
        testCase: 'Email Notifications',
        description: 'Leave request notification email not sending',
        actualResult: 'No email received in inbox',
        expectedResult: 'Email received within 1 minute',
        status: 'OPEN',
      }
    ]
  },
  {
    id: 'proj_003',
    name: "Legacy System Migration",
    owner: 'user',
    category: 'PMO',
    projectStatus: 'Hold',
    progress: 45,
    startDate: '2023-09-15',
    issues: []
  },
  {
    id: 'proj_004',
    name: "API Gateway Upgrade",
    owner: 'user',
    category: 'SDA',
    projectStatus: 'Project Done',
    progress: 100,
    startDate: '2025-07-28',
    issues: []
  }
];

// --- Login Component ---
interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState('');
  const [error, setError] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaChallenge(result);
    setCaptchaInput('');
    setError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (!foundUser) {
      setError('Invalid username or password.');
      return;
    }

    if (captchaInput.toUpperCase() !== captchaChallenge) {
      setError('Incorrect captcha. Please try again.');
      generateCaptcha();
      return;
    }

    // Success
    onLogin(foundUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-indigo-50">
        <div className="bg-indigo-600 p-8 text-center">
           <img 
             loading="lazy" 
             src="https://cms1.artajasa.co.id/storage/main-layout-headers/February2025/kRJJa1JvsCP6F42KITVZ.png"
             alt="Logo"
             className="mx-auto mb-4 h-16 object-contain bg-white/10 rounded-lg p-2 backdrop-blur-sm"
           />
           <h1 className="text-2xl font-bold text-white">Daily Report Project Portal</h1>
           <p className="text-indigo-100 text-sm mt-1">Access Portal</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Check</label>
              <div className="flex gap-3 mb-3">
                <div className="flex-1 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden select-none">
                  {/* Background noise simulation */}
                  <div className="absolute inset-0 opacity-10" 
                       style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '10px 10px'}}>
                  </div>
                  <span className="text-2xl font-mono font-bold text-slate-700 tracking-[0.2em] relative z-10" style={{textShadow: '2px 2px 2px rgba(0,0,0,0.1)'}}>
                    {captchaChallenge}
                  </span>
                  {/* Strike-through line */}
                  <div className="absolute w-full h-0.5 bg-slate-400/30 transform -rotate-3 top-1/2"></div>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                  title="Refresh Captcha"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono uppercase placeholder:font-sans placeholder:normal-case"
                placeholder="Enter characters shown above"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01]"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
           <p className="text-xs text-center text-gray-400">
             Protected by Artajasa v1.0
           </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  // --- Auth & User State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry'>('dashboard');
  
  // Project State
  const [projects, setProjects] = useState<ProjectData[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  // Form State
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('');
  const [tempProgress, setTempProgress] = useState(0);

  // New Project State
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState<ProjectCategory>('PMO');

  // Issue Form State
  const [newIssue, setNewIssue] = useState<Omit<Issue, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    caseNumber: '',
    testCase: '',
    description: '',
    actualResult: '',
    expectedResult: '',
    status: 'OPEN'
  });
  const [issueSearchTerm, setIssueSearchTerm] = useState('');

  // Resolving/Closing Issue State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolvingIssue, setResolvingIssue] = useState<Issue | null>(null);
  const [resolveData, setResolveData] = useState({
    correction: '',
    dateClosed: new Date().toISOString().split('T')[0]
  });

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'WA' | 'EMAIL'>('WA');
  const [reportForm, setReportForm] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    testingDuration: '',
    activity: 'SIT',
    delayDays: '0'
  });

  // AI State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Derived State for RBAC ---

  // Filter projects based on user role
  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];
    return projects.filter(p => p.owner === currentUser.username);
  }, [projects, currentUser]);

  // Determine active project.
  useEffect(() => {
    if (visibleProjects.length > 0) {
      const isActiveVisible = visibleProjects.some(p => p.id === activeProjectId);
      if (!activeProjectId || !isActiveVisible) {
        setActiveProjectId(visibleProjects[0].id);
      }
    } else {
      setActiveProjectId('');
    }
  }, [visibleProjects, activeProjectId]);

  const currentProject = useMemo(() => 
    visibleProjects.find(p => p.id === activeProjectId),
  [visibleProjects, activeProjectId]);

  // Filtered issues based on search term
  const filteredIssues = useMemo(() => {
    if (!currentProject) return [];
    const term = issueSearchTerm.toLowerCase();
    return currentProject.issues.filter(issue => 
      issue.description.toLowerCase().includes(term) ||
      issue.caseNumber.toLowerCase().includes(term) ||
      issue.testCase.toLowerCase().includes(term) ||
      issue.actualResult.toLowerCase().includes(term) ||
      issue.expectedResult.toLowerCase().includes(term)
    );
  }, [currentProject, issueSearchTerm]);

  // --- User Dashboard specific metrics ---
  const userDashboardMetrics = useMemo(() => {
    if (!currentUser) return null;
    
    const pmoProjects = visibleProjects.filter(p => p.category === 'PMO');
    const sdaProjects = visibleProjects.filter(p => p.category === 'SDA');

    const getStatusCounts = (projs: ProjectData[]) => {
      const counts = {
        'Progress': 0,
        'Hold': 0,
        'Drop': 0,
        'Pengujian Done': 0,
        'Project Done': 0
      };
      projs.forEach(p => {
        if (counts[p.projectStatus] !== undefined) {
          counts[p.projectStatus]++;
        }
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    return {
      pmoTotal: pmoProjects.length,
      sdaTotal: sdaProjects.length,
      pmoStatusData: getStatusCounts(pmoProjects),
      sdaStatusData: getStatusCounts(sdaProjects)
    };
  }, [visibleProjects, currentUser]);


  // --- Handlers ---

  const handleUpdateProjectInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, name: tempProjectName, progress: tempProgress }
        : p
    ));
    setIsEditingProject(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newProject: ProjectData = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProjectName,
      owner: currentUser.username,
      category: newProjectCategory,
      projectStatus: 'Progress',
      progress: 0,
      startDate: newProjectStartDate || new Date().toISOString().split('T')[0],
      issues: []
    };

    setProjects(prev => [...prev, newProject]);
    setNewProjectName('');
    setNewProjectStartDate('');
    setIsCreatingProject(false);
    setActiveProjectId(newProject.id); // Switch to new project
    alert("Project created successfully!");
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    const issueToAdd: Issue = {
      ...newIssue,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId
        ? { ...p, issues: [...p.issues, issueToAdd] }
        : p
    ));

    // Reset form
    setNewIssue({
      date: new Date().toISOString().split('T')[0],
      caseNumber: '',
      testCase: '',
      description: '',
      actualResult: '',
      expectedResult: '',
      status: 'OPEN'
    });
    alert("Issue added successfully!");
  };

  const handleDeleteIssue = (id: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      setProjects(prev => prev.map(p => 
        p.id === activeProjectId
          ? { ...p, issues: p.issues.filter(i => i.id !== id) }
          : p
      ));
    }
  };

  // Resolve Workflow Handlers
  const handleOpenResolveModal = (issue: Issue) => {
    setResolvingIssue(issue);
    setResolveData({
      correction: issue.correction || '',
      dateClosed: issue.dateClosed || new Date().toISOString().split('T')[0]
    });
    setResolveModalOpen(true);
  }

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue) return;

    setProjects(prev => prev.map(p => 
      p.id === activeProjectId
        ? {
            ...p,
            issues: p.issues.map(i => i.id === resolvingIssue.id ? {
              ...i,
              status: 'CLOSED',
              correction: resolveData.correction,
              dateClosed: resolveData.dateClosed
            } : i)
          }
        : p
    ));
    setResolveModalOpen(false);
    setResolvingIssue(null);
  }

  // Report Sending Logic
  const handleOpenReportModal = (type: 'WA' | 'EMAIL') => {
    setReportType(type);
    setReportModalOpen(true);
  };

  const generateReportMessage = () => {
    if (!currentProject) return '';

    // Formatting date to localized string (e.g. 28 Juli 2025)
    const formatDate = (dateString: string) => {
       if(!dateString) return '-';
       const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
       return new Date(dateString).toLocaleDateString('id-ID', options);
    }
    
    const inputDateFormatted = formatDate(reportForm.reportDate);
    const startDateFormatted = formatDate(currentProject.startDate);

    if (reportType === 'WA') {
      return `Berikut Update Status Pengujian "${currentProject.name}" mulai pengujian tanggal "${startDateFormatted}"

- Nama Project : ${currentProject.name}
- Tanggal Pengujian : ${inputDateFormatted}
- Jumlah Hari Pengujian : ${reportForm.testingDuration} Hari
- Jadwal Pengujian : -
- Kegiatan Hari ini : ${reportForm.activity}
- Jumlah Hari Keterlambatan : ${reportForm.delayDays} Hari
- Progress Pengujian : ${currentProject.progress}%

Detail temuan selama pengujian dilampirkan pada email laporan harian.
Terimakasih.`;
    } 
    else {
      // Basic Email Body Template (Similar structure)
      return `Dear Team,

Berikut adalah update status harian untuk project:

Nama Project: ${currentProject.name}
Tanggal Pengujian: ${inputDateFormatted}
Mulai Pengujian: ${startDateFormatted}
Progress Saat Ini: ${currentProject.progress}%
Jumlah Hari Pengujian: ${reportForm.testingDuration}
Kegiatan Hari Ini: ${reportForm.activity}
Keterlambatan: ${reportForm.delayDays} Hari

Detail temuan issues terlampir dalam laporan ini.

Terimakasih.`;
    }
  };

  const handleSendReport = () => {
    const message = generateReportMessage();
    if (reportType === 'WA') {
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    } else {
       const subject = encodeURIComponent(`Daily Report: ${currentProject?.name}`);
       const body = encodeURIComponent(message);
       window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
    setReportModalOpen(false);
  };

  const handleGenerateAIReport = async () => {
    if (!currentProject) return;
    setIsAnalyzing(true);
    setAiReport(null);
    const report = await analyzeProjectReport(currentProject);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setCurrentUser(null);
      // Reset state
      setActiveTab('dashboard');
      setActiveProjectId('');
      setIssueSearchTerm('');
      setIsEditingProject(false);
      setIsCreatingProject(false);
      setTempProjectName('');
      setTempProgress(0);
      setNewProjectName('');
      setNewProjectStartDate('');
      setNewIssue({
        date: new Date().toISOString().split('T')[0],
        caseNumber: '',
        testCase: '',
        description: '',
        actualResult: '',
        expectedResult: '',
        status: 'OPEN'
      });
      setResolvingIssue(null);
      setAiReport(null);
      setIsAnalyzing(false);
    }
  }

  // --- Render Components ---

  const renderDashboard = () => {
    if (!currentProject && visibleProjects.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <FolderPlus className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Projects Found</h3>
          <p className="text-gray-500 mb-6">You don't have any projects assigned or created yet.</p>
          <button 
             onClick={() => setActiveTab('entry')}
             className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Create Your First Project
          </button>
        </div>
      );
    }

    // --- USER ROLE DASHBOARD (Default/Only) ---
    if (userDashboardMetrics) {
      return (
        <div className="space-y-6 animate-fadeIn">
          {/* User Role: Project Count Cards (Split PMO / SDA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              title="Total Project (PMO)" 
              value={userDashboardMetrics.pmoTotal} 
              icon={Briefcase} 
              colorClass="bg-indigo-500" 
              trend="Managed by PMO"
            />
            <StatCard 
              title="Total Project BAU (SDA)" 
              value={userDashboardMetrics.sdaTotal} 
              icon={Layers} 
              colorClass="bg-violet-500" 
              trend="Standard BAU"
            />
          </div>

          {/* User Role: Charts for Project Status (PMO vs SDA) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Project (PMO) Status
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userDashboardMetrics.pmoStatusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill={COLORS.PMO} radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-500" />
                BAU (SDA) Status
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userDashboardMetrics.sdaStatusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill={COLORS.SDA} radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* User Role: Modified Recent Issues Table */}
          {renderRecentIssuesTable()}
          
          {/* AI Analysis Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <BrainCircuit className="w-6 h-6" />
                AI Project Analysis
              </h3>
              <button 
                onClick={handleGenerateAIReport}
                disabled={isAnalyzing || !currentProject}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-md
                  ${(isAnalyzing || !currentProject) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
              </button>
            </div>
            {aiReport ? (
              <div className="prose prose-sm max-w-none text-gray-700 bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                <pre className="whitespace-pre-wrap font-sans">{aiReport}</pre>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Select a project in the Report Management tab and come back to generate analysis, or click above if a project is active.
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderRecentIssuesTable = () => {
    let displayIssues: (Issue & { projectName: string })[] = [];

    // Aggregate issues from all visible projects
    visibleProjects.forEach(p => {
      p.issues.forEach(i => {
        displayIssues.push({ ...i, projectName: p.name });
      });
    });
    // Sort by date descending
    displayIssues.sort((a, b) => b.date.localeCompare(a.date));
    displayIssues = displayIssues.slice(0, 10); // Take top 10

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Issues</h3>
          <button 
            onClick={() => setActiveTab('entry')}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
          >
            View All & Manage &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Project</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayIssues.map((issue) => (
                <tr key={`${issue.projectName}-${issue.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{issue.date}</td>
                  <td className="p-4 text-sm text-indigo-600 font-medium">{issue.projectName}</td>
                  <td className="p-4 text-sm text-gray-800 font-medium max-w-xs truncate" title={issue.description}>{issue.description}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${issue.status === 'OPEN' ? 'bg-red-100 text-red-800' : 
                        issue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 
                        'bg-emerald-100 text-emerald-800'}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs text-gray-400">Read-only</span>
                  </td>
                </tr>
              ))}
              {displayIssues.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No issues reported yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEntry = () => (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Project Management Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-500" />
            Project Status Management
          </h2>
          <div className="flex gap-2">
            {currentProject && (
              <>
                <button
                   onClick={() => handleOpenReportModal('WA')}
                   className="text-sm bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                >
                   <MessageCircle className="w-4 h-4" />
                   Send to WA
                </button>
                <button
                   onClick={() => handleOpenReportModal('EMAIL')}
                   className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                >
                   <Mail className="w-4 h-4" />
                   Send to Email
                </button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button
                  onClick={() => {
                    setIsEditingProject(!isEditingProject);
                    setIsCreatingProject(false);
                    if(!isEditingProject) {
                       setTempProjectName(currentProject.name);
                       setTempProgress(currentProject.progress);
                    }
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 bg-indigo-50 rounded"
                >
                  {isEditingProject ? 'Cancel Editing' : 'Edit Details'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project Selector & Creator */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Select Active Project
              </label>
              {visibleProjects.length > 0 ? (
                <select
                  value={activeProjectId}
                  onChange={(e) => {
                    setActiveProjectId(e.target.value);
                    setIsCreatingProject(false);
                    setIsEditingProject(false);
                  }}
                  className="w-full rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border bg-white text-gray-800 font-medium"
                >
                  {visibleProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-500 italic p-2">No projects found.</p>
              )}
            </div>
            
            <button
              onClick={() => {
                setIsCreatingProject(!isCreatingProject);
                setIsEditingProject(false);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <FolderPlus className="w-4 h-4" />
              {isCreatingProject ? 'Cancel Creation' : 'New Project'}
            </button>
          </div>
        </div>

        {/* Create Project Form */}
        {isCreatingProject && (
          <form onSubmit={handleCreateProject} className="bg-indigo-100 p-6 rounded-lg mb-6 border border-indigo-200 animate-fadeIn">
            <h3 className="font-bold text-indigo-900 mb-4">Create New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-indigo-800 mb-1">Project Category</label>
                <select 
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value as ProjectCategory)}
                  className="w-full rounded-md border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
                >
                  <option value="PMO">Project (PMO)</option>
                  <option value="SDA">BAU (SDA)</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-indigo-800 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full rounded-md border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  placeholder="e.g. Website Redesign Q1"
                />
              </div>
               <div className="col-span-1">
                <label className="block text-sm font-medium text-indigo-800 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={newProjectStartDate}
                  onChange={(e) => setNewProjectStartDate(e.target.value)}
                  className="w-full rounded-md border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
              <div className="col-span-1 md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Edit Project Form */}
        {isEditingProject && currentProject && (
          <form onSubmit={handleUpdateProjectInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={tempProjectName}
                onChange={(e) => setTempProjectName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion Percentage (%)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempProgress}
                  onChange={(e) => setTempProgress(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                {/* Manual Input for Percentage */}
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tempProgress}
                  onChange={(e) => setTempProgress(Number(e.target.value))}
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-center font-bold text-indigo-600"
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={currentProject.category}
                onChange={(e) => setProjects(prev => prev.map(p => p.id === currentProject.id ? {...p, category: e.target.value as ProjectCategory} : p))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
              >
                <option value="PMO">Project (PMO)</option>
                <option value="SDA">BAU (SDA)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Status</label>
              <select
                value={currentProject.projectStatus}
                onChange={(e) => setProjects(prev => prev.map(p => p.id === currentProject.id ? {...p, projectStatus: e.target.value as ProjectStatus} : p))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
              >
                 <option value="Progress">Progress</option>
                 <option value="Hold">Hold</option>
                 <option value="Drop">Drop</option>
                 <option value="Pengujian Done">Pengujian Done</option>
                 <option value="Project Done">Project Done</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Project Status
              </button>
            </div>
          </form>
        )}
        
        {/* Project Info View */}
        {!isEditingProject && !isCreatingProject && currentProject && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Project</p>
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-lg font-bold text-gray-900">{currentProject.name}</p>
                     <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <UserIcon className="w-3 h-3" />
                        Owner: {currentProject.owner}
                     </div>
                     <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <CalendarCheck className="w-3 h-3" />
                        Start Date: {currentProject.startDate || '-'}
                     </div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${currentProject.category === 'PMO' ? 'bg-indigo-500' : 'bg-violet-500'}`}>
                        {currentProject.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700">
                        {currentProject.projectStatus}
                      </span>
                   </div>
                </div>
             </div>
             <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Completion</p>
                <div className="flex items-center gap-3 mt-2">
                   <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${currentProject.progress}%` }}></div>
                   </div>
                   <span className="text-lg font-bold text-indigo-600">{currentProject.progress}%</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {currentProject ? (
        <>
          {/* 2. Add New Issue Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-500" />
              Log New Issue
            </h2>
            
            <form onSubmit={handleAddIssue} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Date */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Open</label>
                <input
                  type="date"
                  required
                  value={newIssue.date}
                  onChange={(e) => setNewIssue({...newIssue, date: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>

              {/* Status */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newIssue.status}
                  onChange={(e) => setNewIssue({...newIssue, status: e.target.value as IssueStatus})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
              </div>

              {/* Case Number */}
              <div className="col-span-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                 <input 
                   type="text"
                   required
                   value={newIssue.caseNumber || ''}
                   onChange={(e) => setNewIssue({...newIssue, caseNumber: e.target.value})}
                   placeholder="e.g. TC-001"
                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                 />
              </div>

              {/* Test Case */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Test Case</label>
                 <input 
                   type="text"
                   required
                   value={newIssue.testCase || ''}
                   onChange={(e) => setNewIssue({...newIssue, testCase: e.target.value})}
                   placeholder="Title of the test case..."
                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                 />
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea
                  required
                  rows={2}
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                  placeholder="Describe the bug or issue..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>

               {/* Actual Result */}
               <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Result</label>
                <textarea
                  required
                  rows={2}
                  value={newIssue.actualResult}
                  onChange={(e) => setNewIssue({...newIssue, actualResult: e.target.value})}
                  placeholder="What actually happened?"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>

               {/* Expected Result */}
               <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Result</label>
                <textarea
                  required
                  rows={2}
                  value={newIssue.expectedResult}
                  onChange={(e) => setNewIssue({...newIssue, expectedResult: e.target.value})}
                  placeholder="What was supposed to happen?"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end">
                 <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md font-medium"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Issue to Report
                  </button>
              </div>
            </form>
          </div>

          {/* 3. Manage Existing Issues Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4 flex-wrap">
               <h2 className="text-xl font-bold text-gray-800">Issue Log History</h2>
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input 
                   type="text" 
                   placeholder="Search issues..." 
                   value={issueSearchTerm}
                   onChange={(e) => setIssueSearchTerm(e.target.value)}
                   className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
                 />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                  <tr>
                    <th className="p-4 border-b whitespace-nowrap">Date Open</th>
                    <th className="p-4 border-b min-w-[200px]">Issue Description</th>
                    <th className="p-4 border-b min-w-[150px]">Test Case</th>
                    <th className="p-4 border-b min-w-[200px]">Actual Result</th>
                    <th className="p-4 border-b min-w-[200px]">Expected Result</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b min-w-[200px]">Hasil Perbaikan</th>
                    <th className="p-4 border-b whitespace-nowrap">Date Close</th>
                    <th className="p-4 border-b text-right min-w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredIssues.length === 0 ? (
                     <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-400">
                          {issueSearchTerm ? 'No issues match your search.' : 'No issues recorded. Add one above.'}
                        </td>
                     </tr>
                  ) : (
                    filteredIssues.slice().reverse().map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-4 align-top text-gray-500 whitespace-nowrap">{issue.date}</td>
                          <td className="p-4 align-top font-medium text-gray-800">{issue.description}</td>
                          <td className="p-4 align-top text-gray-600">{issue.testCase || '-'}</td>
                          <td className="p-4 align-top text-gray-600 text-xs">{issue.actualResult || '-'}</td>
                          <td className="p-4 align-top text-gray-600 text-xs">{issue.expectedResult || '-'}</td>
                          <td className="p-4 align-top">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${issue.status === 'OPEN' ? 'bg-red-100 text-red-800' : 
                                  issue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 
                                  'bg-emerald-100 text-emerald-800'}`}>
                                {issue.status.replace('_', ' ')}
                              </span>
                          </td>
                          <td className="p-4 align-top text-gray-600">
                            {issue.correction || '-'}
                          </td>
                           <td className="p-4 align-top text-gray-500 whitespace-nowrap">{issue.dateClosed || '-'}</td>
                          <td className="p-4 align-top text-right">
                            <div className="flex items-center justify-end gap-1">
                                {issue.status !== 'CLOSED' && (
                                  <button 
                                    onClick={() => handleOpenResolveModal(issue)}
                                    className="text-white bg-indigo-600 hover:bg-indigo-700 rounded px-3 py-1.5 transition-colors shadow-sm text-xs flex items-center gap-1 whitespace-nowrap"
                                    title="Resolve / Close Issue"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Resolve
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteIssue(issue.id)}
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors"
                                  title="Delete Issue"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                          </td>
                        </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
         <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-400">Please select or create a project to manage issues.</p>
         </div>
      )}

      {/* Resolve Issue Modal */}
      {resolveModalOpen && resolvingIssue && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
               <div className="bg-indigo-600 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Resolve Issue
                  </h3>
                  <button 
                    onClick={() => setResolveModalOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
               
               <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                     <p className="text-xs text-gray-500 uppercase font-bold">Issue</p>
                     <p className="text-gray-800 text-sm">{resolvingIssue.description}</p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Date Closed (Update Date)</label>
                     <div className="relative">
                        <CalendarCheck className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                           type="date"
                           required
                           value={resolveData.dateClosed}
                           onChange={(e) => setResolveData({...resolveData, dateClosed: e.target.value})}
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Hasil Perbaikan (Correction)</label>
                     <textarea 
                        rows={3}
                        required
                        value={resolveData.correction}
                        onChange={(e) => setResolveData({...resolveData, correction: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Detail the fix applied..."
                     />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                     <button 
                        type="button"
                        onClick={() => setResolveModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                     >
                        Close Issue
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Report Preview Modal (WA/Email) */}
      {reportModalOpen && currentProject && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
               <div className={`p-4 flex justify-between items-center ${reportType === 'WA' ? 'bg-green-500' : 'bg-blue-600'}`}>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {reportType === 'WA' ? <MessageCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    Preview {reportType === 'WA' ? 'WhatsApp' : 'Email'} Report
                  </h3>
                  <button 
                    onClick={() => setReportModalOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
               
               <div className="p-6 overflow-y-auto flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pengujian</label>
                      <input 
                         type="date" 
                         value={reportForm.reportDate}
                         onChange={(e) => setReportForm({...reportForm, reportDate: e.target.value})}
                         className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hari Pengujian</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          value={reportForm.testingDuration}
                          onChange={(e) => setReportForm({...reportForm, testingDuration: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg pr-12"
                          placeholder="e.g. 5"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">Hari</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Hari Ini</label>
                      <select 
                        value={reportForm.activity}
                        onChange={(e) => setReportForm({...reportForm, activity: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                      >
                         <option value="SIT">SIT (System Integration Testing)</option>
                         <option value="UAT">UAT (User Acceptance Testing)</option>
                         <option value="SIT & UAT">SIT & UAT</option>
                         <option value="Regression">Regression Testing</option>
                         <option value="Penetration Test">Penetration Test</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hari Keterlambatan</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          value={reportForm.delayDays}
                          onChange={(e) => setReportForm({...reportForm, delayDays: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg pr-12"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">Hari</span>
                      </div>
                    </div>
                 </div>

                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Message Preview</p>
                    <div className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-gray-200">
                       {generateReportMessage()}
                    </div>
                 </div>
               </div>

               <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                 <button 
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleSendReport}
                    className={`px-6 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 ${reportType === 'WA' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                 >
                    <Send className="w-4 h-4" />
                    Send Report
                 </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );

  // --- Main Return for App ---

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <img 
               src="https://cms1.artajasa.co.id/storage/main-layout-headers/February2025/kRJJa1JvsCP6F42KITVZ.png" 
               alt="Logo" 
               className="w-6 h-6 object-contain filter brightness-0 invert" 
             />
          </div>
          <span className="font-bold text-xl text-indigo-900 tracking-tight">ProjectPortal</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('entry')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'entry' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${activeTab === 'entry' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Report Management
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
             onClick={handleLogout}
             className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
             <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {activeTab === 'dashboard' ? 'Dashboard Overview' : 'Project Reports & Issues'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, <span className="font-medium text-indigo-600">{currentUser.username}</span>
                </p>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-indigo-50 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-700 border border-indigo-100 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   {visibleProjects.length} Active Projects
                </div>
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                   {currentUser.username.charAt(0).toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
           {activeTab === 'dashboard' ? renderDashboard() : renderEntry()}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);