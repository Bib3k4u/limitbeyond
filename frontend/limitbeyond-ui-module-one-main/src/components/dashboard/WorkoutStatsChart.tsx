import { useEffect, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Card } from '@/components/ui/card';
import { workoutApi } from '@/services/api/workoutApi';
import { WorkoutStats } from '@/types/workout';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function WorkoutStatsChart() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endDate = new Date();
        const startDate = subMonths(endDate, 1); // Last month's data
        
        const response = await workoutApi.getByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        );

        if (response?.data) {
          // Process the workout data into stats
          const stats: WorkoutStats = processWorkoutData(response.data);
          setStats(stats);
        }
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <Card className="p-4">
        <div className="h-[350px] flex items-center justify-center">
          Loading stats...
        </div>
      </Card>
    );
  }

  const chartData: ChartData<'line'> = {
    labels: stats.workoutsByDate.map(d => format(new Date(d.date), 'MMM d')),
    datasets: [
      {
        label: 'Volume (kg)',
        data: stats.workoutsByDate.map(d => d.volume),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Workouts',
        data: stats.workoutsByDate.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Workout Volume & Frequency',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{stats.totalWorkouts}</h3>
          <p className="text-sm text-muted-foreground">Total Workouts</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{stats.completedWorkouts}</h3>
          <p className="text-sm text-muted-foreground">Completed Workouts</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{Math.round(stats.totalVolume).toLocaleString()} kg</h3>
          <p className="text-sm text-muted-foreground">Total Volume</p>
        </div>
      </div>

      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2">Most Trained Muscle Groups</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.muscleGroupDistribution
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map((item) => (
              <div
                key={item.muscleGroup}
                className="bg-lb-darker rounded-lg p-2 text-center"
              >
                <div className="text-sm font-medium">{item.muscleGroup}</div>
                <div className="text-xs text-muted-foreground">
                  {item.count} exercises
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}

// Helper function to process workout data into stats
function processWorkoutData(workouts: any[]): WorkoutStats {
  const stats: WorkoutStats = {
    totalWorkouts: workouts.length,
    completedWorkouts: workouts.filter(w => w.completed).length,
    totalVolume: 0,
    muscleGroupDistribution: [],
    workoutsByDate: [],
  };

  // Create a map to track muscle groups
  const muscleGroupCounts = new Map<string, number>();
  
  // Create a map to track daily stats
  const dailyStats = new Map<string, { volume: number; count: number }>();

  workouts.forEach(workout => {
    const date = format(new Date(workout.scheduledDate || workout.completedDate), 'yyyy-MM-dd');
    let dailyVolume = 0;

    // Process sets
    workout.sets.forEach(set => {
      if (set.completed && set.weight && set.reps) {
        const setVolume = set.weight * set.reps;
        dailyVolume += setVolume;
        stats.totalVolume += setVolume;
      }

      // Count muscle groups
      set.exercise.muscleGroups.forEach(group => {
        const count = muscleGroupCounts.get(group.name) || 0;
        muscleGroupCounts.set(group.name, count + 1);
      });
    });

    // Update daily stats
    const existing = dailyStats.get(date) || { volume: 0, count: 0 };
    dailyStats.set(date, {
      volume: existing.volume + dailyVolume,
      count: existing.count + 1,
    });
  });

  // Convert muscle group counts to array
  stats.muscleGroupDistribution = Array.from(muscleGroupCounts.entries())
    .map(([muscleGroup, count]) => ({ muscleGroup, count }));

  // Convert daily stats to array
  stats.workoutsByDate = Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      volume: stats.volume,
      count: stats.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return stats;
}
