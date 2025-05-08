
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, MessageSquare, Bell, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { UserProfile } from '@/services/api/userService';

interface DashboardOverviewProps {
  userProfile: UserProfile | null;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ userProfile }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (userProfile && userProfile.roles && userProfile.roles.length > 0) {
      setUserRole(userProfile.roles[0]);
    }
  }, [userProfile]);
  
  // Admin Overview Cards
  const adminCards = [
    {
      title: 'Total Members',
      value: '234',
      icon: Users,
      trend: '+12%',
      trendUp: true,
      description: '34 new this month',
      color: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-500/5',
    },
    {
      title: 'Active Trainers',
      value: '26',
      icon: Activity,
      trend: '+3%',
      trendUp: true,
      description: '2 new this month',
      color: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-500/5',
    },
    {
      title: 'Pending Feedbacks',
      value: '18',
      icon: Bell,
      trend: '-2%',
      trendUp: false,
      description: '7 responded today',
      color: 'text-yellow-400',
      gradientFrom: 'from-yellow-500/20',
      gradientTo: 'to-yellow-500/5',
    },
    {
      title: 'Diet Chats',
      value: '45',
      icon: MessageSquare,
      trend: '+8%',
      trendUp: true,
      description: '12 new conversations',
      color: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-500/5',
    },
  ];
  
  // Trainer Overview Cards
  const trainerCards = [
    {
      title: 'Assigned Members',
      value: '28',
      icon: Users,
      trend: '+2%',
      trendUp: true,
      description: '3 new this month',
      color: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-500/5',
    },
    {
      title: 'Pending Feedbacks',
      value: '7',
      icon: Bell,
      trend: '-12%',
      trendUp: false,
      description: '2 responded today',
      color: 'text-yellow-400',
      gradientFrom: 'from-yellow-500/20',
      gradientTo: 'to-yellow-500/5',
    },
    {
      title: 'Diet Chats',
      value: '15',
      icon: MessageSquare,
      trend: '+5%',
      trendUp: true,
      description: '3 new messages',
      color: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-500/5',
    },
    {
      title: 'Member Retention',
      value: '94%',
      icon: Activity,
      trend: '+2%',
      trendUp: true,
      description: 'Great performance',
      color: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-500/5',
    },
  ];

  // Member Overview Cards
  const memberCards = [
    {
      title: 'Days Active',
      value: '24',
      icon: Activity,
      trend: '+4%',
      trendUp: true,
      description: 'Keep it up!',
      color: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-500/5',
    },
    {
      title: 'Diet Chat',
      value: '3',
      icon: MessageSquare,
      trend: '+1%',
      trendUp: true,
      description: '2 new responses',
      color: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-500/5',
    },
    {
      title: 'Feedbacks Sent',
      value: '2',
      icon: Bell,
      trend: '0%',
      trendUp: true,
      description: 'All responded',
      color: 'text-yellow-400',
      gradientFrom: 'from-yellow-500/20',
      gradientTo: 'to-yellow-500/5',
    },
    {
      title: 'Progress',
      value: '68%',
      icon: TrendingUp,
      trend: '+5%',
      trendUp: true,
      description: 'Toward your goal',
      color: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-500/5',
    },
  ];
  
  let cardsToDisplay = memberCards; // Default to member cards
  
  if (userRole === 'ADMIN') {
    cardsToDisplay = adminCards;
  } else if (userRole === 'TRAINER') {
    cardsToDisplay = trainerCards;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardsToDisplay.map((card, index) => (
        <Card 
          key={index}
          className="glass-card transition-all hover:translate-y-[-5px] hover:shadow-lg"
        >
          <CardHeader className={`pb-2 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{card.value}</p>
              <div className={`flex items-center space-x-1 ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {card.trendUp ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{card.trend}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardOverview;
