import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Job, ApplicationStatus, VisaType } from '@/lib/types';

interface AddJobDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (job: Omit<Job, 'id' | 'dateAdded'>) => void;
  editJob?: Job | null;
}

const defaultForm = {
  company: '',
  role: '',
  location: '',
  salary: '',
  visaType: 'Skilled Worker' as VisaType,
  sponsorshipConfirmed: false,
  status: 'saved' as ApplicationStatus,
  deadline: '',
  source: '',
  notes: '',
  technology: '',
};

const AddJobDialog = ({ open, onClose, onSave, editJob }: AddJobDialogProps) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editJob) {
      setForm({
        company: editJob.company,
        role: editJob.role,
        location: editJob.location,
        salary: editJob.salary,
        visaType: editJob.visaType,
        sponsorshipConfirmed: editJob.sponsorshipConfirmed,
        status: editJob.status,
        deadline: editJob.deadline,
        source: editJob.source,
        notes: editJob.notes,
        technology: editJob.technology || '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [editJob, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setForm(defaultForm);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{editJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company *</Label>
              <Input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Infosys UK" />
            </div>
            <div>
              <Label>Role *</Label>
              <Input required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. React Developer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. London" />
            </div>
            <div>
              <Label>Salary</Label>
              <Input value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. £45,000 - £55,000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Visa Type</Label>
              <Select value={form.visaType} onValueChange={v => setForm(f => ({ ...f, visaType: v as VisaType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skilled Worker">Skilled Worker</SelectItem>
                  <SelectItem value="Health & Care">Health & Care</SelectItem>
                  <SelectItem value="Global Talent">Global Talent</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Technology</Label>
              <Input value={form.technology} onChange={e => setForm(f => ({ ...f, technology: e.target.value }))} placeholder="e.g. React, Java" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Deadline</Label>
              <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
            <div>
              <Label>Source</Label>
              <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. LinkedIn, Indeed" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ApplicationStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3 pb-1">
              <Switch checked={form.sponsorshipConfirmed} onCheckedChange={v => setForm(f => ({ ...f, sponsorshipConfirmed: v }))} />
              <Label>Sponsorship Confirmed</Label>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={3} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editJob ? 'Update' : 'Add Job'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobDialog;
