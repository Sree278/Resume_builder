import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobTracker from './components/JobTracker';
import ResumeBuilder from './components/ResumeBuilder';
import AvatarGenerator from './components/AvatarGenerator';
import ClaireChat from './components/ClaireChat';
import Auth from './components/Auth';
import { supabase } from './services/supabase';
import { Job, ViewState, Resume, Message, JobStatus } from './types';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [loading, setLoading] = useState(true);
  
  // Jobs State
  const [jobs, setJobs] = useState<Job[]>([]);

  // Chat State
  const [claireMessages, setClaireMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi there! I'm Claire, your personal job search assistant. How can I help you land your dream job today?"
    }
  ]);
  const [unreadClaire, setUnreadClaire] = useState(false);

  // Resume State
  const [resume, setResume] = useState<Resume>({
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    skills: '',
    experience: [],
    education: [],
    projects: []
  });

  // Handle Session & Initial Fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save resume to Supabase (Debounced)
  useEffect(() => {
    if (!session || !resume.fullName) return; // Don't save empty init state
    const timer = setTimeout(() => {
        saveResumeToSupabase(resume);
    }, 2000);
    return () => clearTimeout(timer);
  }, [resume, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobsError) throw jobsError;
      
      // Transform snake_case to camelCase manually if needed, or assume table columns match types if carefully created.
      // Based on SQL, columns are snake_case (date_applied, cover_letter, etc). We need to map them.
      const mappedJobs: Job[] = (jobsData || []).map((j: any) => ({
        id: j.id,
        company: j.company,
        role: j.role,
        location: j.location,
        salary: j.salary,
        status: j.status,
        dateApplied: j.date_applied, // Map snake_case to camelCase
        description: j.description,
        coverLetter: j.cover_letter,
        interviewGuide: j.interview_guide,
        email: j.email,
        origin: j.origin
      }));
      setJobs(mappedJobs);

      // Fetch Resume
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .limit(1)
        .single();
        
      if (resumeData) {
        setResume({
           fullName: resumeData.full_name,
           email: resumeData.email,
           phone: resumeData.phone,
           summary: resumeData.summary,
           skills: resumeData.skills,
           experience: resumeData.experience || [],
           education: resumeData.education || [],
           projects: resumeData.projects || [],
           avatar: resumeData.avatar
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveResumeToSupabase = async (currentResume: Resume) => {
    const { data: existing } = await supabase.from('resumes').select('id').limit(1).single();
    
    const payload = {
       full_name: currentResume.fullName,
       email: currentResume.email,
       phone: currentResume.phone,
       summary: currentResume.summary,
       skills: currentResume.skills,
       experience: currentResume.experience,
       education: currentResume.education,
       projects: currentResume.projects,
       avatar: currentResume.avatar,
       user_id: session?.user.id
    };

    if (existing) {
       await supabase.from('resumes').update(payload).eq('id', existing.id);
    } else {
       await supabase.from('resumes').insert(payload);
    }
  };

  // Job Actions
  const handleAddJob = async (job: Job) => {
    // Optimistic UI update
    const tempId = Date.now().toString();
    const optimisticJob = { ...job, id: tempId };
    setJobs(prev => [optimisticJob, ...prev]);

    try {
      const { data, error } = await supabase.from('jobs').insert({
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        status: job.status,
        date_applied: job.dateApplied,
        description: job.description,
        cover_letter: job.coverLetter,
        interview_guide: job.interviewGuide,
        email: job.email,
        origin: job.origin,
        user_id: session?.user.id
      }).select().single();

      if (error) throw error;

      // Replace optimistic job with real one
      const realJob: Job = {
        ...job,
        id: data.id,
      };
      setJobs(prev => prev.map(j => j.id === tempId ? realJob : j));
    } catch (error) {
      console.error("Error adding job", error);
      // Revert optimistic update
      setJobs(prev => prev.filter(j => j.id !== tempId));
    }
  };

  const handleUpdateJob = async (job: Job) => {
    setJobs(prev => prev.map(j => j.id === job.id ? job : j));

    // Check for Status Change notification
    const oldJob = jobs.find(j => j.id === job.id);
    if (oldJob && oldJob.status !== job.status) {
       handleJobStatusChangeNotification(job, job.status as JobStatus);
    }

    try {
      await supabase.from('jobs').update({
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        status: job.status,
        date_applied: job.dateApplied,
        description: job.description,
        cover_letter: job.coverLetter,
        interview_guide: job.interviewGuide,
        email: job.email
      }).eq('id', job.id);
    } catch (error) {
      console.error("Error updating job", error);
    }
  };

  const handleDeleteJob = async (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    try {
      await supabase.from('jobs').delete().eq('id', id);
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  const handleAttachAvatar = (avatarUrl: string) => {
    setResume(prev => ({ ...prev, avatar: avatarUrl }));
  };

  const handleJobStatusChangeNotification = (job: Job, newStatus: JobStatus) => {
    if (newStatus === JobStatus.ACCEPTED || newStatus === JobStatus.REJECTED) {
      let messageText = '';
      
      if (newStatus === JobStatus.ACCEPTED) {
        messageText = `🎉 Congratulations! I noticed you accepted an offer for the **${job.role}** position at **${job.company}**! That is absolutely fantastic news! Do you need any tips on salary negotiation or preparing for your first day?`;
      } else if (newStatus === JobStatus.REJECTED) {
        messageText = `I saw the update about the **${job.role}** role at **${job.company}**. I know that can be disappointing, but don't let it discourage you. Rejection is often just redirection. 🦁 Would you like to analyze the job description together to see if there are any skills we can highlight better for next time?`;
      }

      if (messageText) {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: 'model',
          text: messageText
        };
        
        setClaireMessages(prev => [...prev, newMessage]);
        if (currentView !== ViewState.CLAIRE) {
          setUnreadClaire(true);
        }
      }
    }
  };

  // Clear unread badge when viewing Claire
  useEffect(() => {
    if (currentView === ViewState.CLAIRE) {
      setUnreadClaire(false);
    }
  }, [currentView]);

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard jobs={jobs} />;
      case ViewState.JOBS:
        return (
           <JobTracker 
             jobs={jobs} 
             onAddJob={handleAddJob}
             onUpdateJob={handleUpdateJob}
             onDeleteJob={handleDeleteJob}
             viewMode="applications" 
           />
        );
      case ViewState.OFFERS:
        return (
          <JobTracker 
             jobs={jobs} 
             onAddJob={handleAddJob}
             onUpdateJob={handleUpdateJob}
             onDeleteJob={handleDeleteJob}
             viewMode="offers" 
           />
        );
      case ViewState.RESUME:
        return <ResumeBuilder resume={resume} setResume={setResume} />;
      case ViewState.AVATAR:
        return <AvatarGenerator onAttachToResume={handleAttachAvatar} />;
      case ViewState.CLAIRE:
        return <ClaireChat messages={claireMessages} setMessages={setClaireMessages} />;
      default:
        return <Dashboard jobs={jobs} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-rose text-slate-800 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        hasUnreadMessages={unreadClaire}
      />
      
      <main className="flex-1 h-screen overflow-auto relative custom-scrollbar">
        {loading ? (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        ) : renderContent()}
      </main>
    </div>
  );
};

export default App;