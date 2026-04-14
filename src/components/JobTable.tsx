import { motion } from 'framer-motion';
import { ExternalLink, Shield, ShieldOff, Trash2, Edit } from 'lucide-react';
import { Job, ApplicationStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface JobTableProps {
  jobs: Job[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (job: Job) => void;
}

const statusOptions: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected'];

const statusClass: Record<ApplicationStatus, string> = {
  saved: 'status-badge status-saved',
  applied: 'status-badge status-applied',
  interview: 'status-badge status-interview',
  offer: 'status-badge status-offer',
  rejected: 'status-badge status-rejected',
};

const JobTable = ({ jobs, onStatusChange, onDelete, onEdit }: JobTableProps) => {
  if (jobs.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-muted-foreground text-lg">No jobs found. Add your first job listing!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="font-heading font-semibold">Company</TableHead>
            <TableHead className="font-heading font-semibold">Role</TableHead>
            <TableHead className="font-heading font-semibold">Location</TableHead>
            <TableHead className="font-heading font-semibold">Salary</TableHead>
            <TableHead className="font-heading font-semibold">Visa</TableHead>
            <TableHead className="font-heading font-semibold">Sponsor</TableHead>
            <TableHead className="font-heading font-semibold">Status</TableHead>
            <TableHead className="font-heading font-semibold">Deadline</TableHead>
            <TableHead className="font-heading font-semibold">Source</TableHead>
            <TableHead className="font-heading font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job, i) => (
            <motion.tr
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-border hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{job.company}</TableCell>
              <TableCell>{job.role}</TableCell>
              <TableCell className="text-muted-foreground">{job.location}</TableCell>
              <TableCell className="text-sm">{job.salary}</TableCell>
              <TableCell><span className="text-xs">{job.visaType}</span></TableCell>
              <TableCell>
                {job.sponsorshipConfirmed ? (
                  <Shield className="w-4 h-4 text-success" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-muted-foreground" />
                )}
              </TableCell>
              <TableCell>
                <Select value={job.status} onValueChange={(v) => onStatusChange(job.id, v as ApplicationStatus)}>
                  <SelectTrigger className="w-28 h-7 text-xs border-0 p-0">
                    <span className={statusClass[job.status]}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{job.deadline}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{job.source}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(job)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(job.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default JobTable;
