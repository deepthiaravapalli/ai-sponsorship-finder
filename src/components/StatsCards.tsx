import { motion } from 'framer-motion';
import { Briefcase, Send, MessageSquare, Trophy, Bookmark } from 'lucide-react';
import { Job } from '@/lib/types';

interface StatsCardsProps {
  jobs: Job[];
}

const StatsCards = ({ jobs }: StatsCardsProps) => {
  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'text-primary' },
    { label: 'Applied', value: jobs.filter(j => j.status === 'applied').length, icon: Send, color: 'text-info' },
    { label: 'Interviews', value: jobs.filter(j => j.status === 'interview').length, icon: MessageSquare, color: 'text-warning' },
    { label: 'Offers', value: jobs.filter(j => j.status === 'offer').length, icon: Trophy, color: 'text-success' },
    { label: 'Saved', value: jobs.filter(j => j.status === 'saved').length, icon: Bookmark, color: 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className="stat-card-value">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
