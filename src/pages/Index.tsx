import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCards from '@/components/StatsCards';
import JobTable from '@/components/JobTable';
import AddJobDialog from '@/components/AddJobDialog';
import SearchFilters from '@/components/SearchFilters';
import { Job, ApplicationStatus } from '@/lib/types';
import { sampleJobs } from '@/lib/sampleData';

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);

  const technologies = useMemo(() => {
    const techs = new Set(jobs.map(j => j.technology).filter(Boolean) as string[]);
    return Array.from(techs).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchSearch = search === '' || 
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.role.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchTech = techFilter === 'all' || job.technology === techFilter;
      return matchSearch && matchStatus && matchTech;
    });
  }, [jobs, search, statusFilter, techFilter]);

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const handleDelete = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleSave = (data: Omit<Job, 'id' | 'dateAdded'>) => {
    if (editJob) {
      setJobs(prev => prev.map(j => j.id === editJob.id ? { ...j, ...data } : j));
      setEditJob(null);
    } else {
      const newJob: Job = {
        ...data,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString().split('T')[0],
      };
      setJobs(prev => [newJob, ...prev]);
    }
  };

  const handleEdit = (job: Job) => {
    setEditJob(job);
    setDialogOpen(true);
  };

  const sponsorCount = jobs.filter(j => j.sponsorshipConfirmed).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold tracking-tight">UK Sponsorship Tracker</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Job Sponsorship Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <FileText className="w-4 h-4" />
              {sponsorCount} Confirmed Sponsors
            </div>
            <Button onClick={() => { setEditJob(null); setDialogOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Job
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/20 p-6"
        >
          <h2 className="font-heading font-bold text-lg">Welcome to NCPL UK Sponsorship Tracker 🇬🇧</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track sponsorship jobs, manage applications, and find companies that sponsor work visas. 
            Search across LinkedIn, Indeed, Gov.uk sponsor lists, and more.
          </p>
        </motion.div>

        {/* Stats */}
        <StatsCards jobs={jobs} />

        {/* Filters + Table */}
        <div className="space-y-4">
          <SearchFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            techFilter={techFilter}
            onTechFilterChange={setTechFilter}
            technologies={technologies}
          />
          <JobTable
            jobs={filteredJobs}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>NCPL AI-Powered UK Job Sponsorship Tracker • Built at AI Prompt-to-Product Workshop 2025</p>
      </footer>

      <AddJobDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditJob(null); }}
        onSave={handleSave}
        editJob={editJob}
      />
    </div>
  );
};

export default Index;
