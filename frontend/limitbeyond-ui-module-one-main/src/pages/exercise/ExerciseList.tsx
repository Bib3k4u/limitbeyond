import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { exerciseTemplatesApi } from "@/services/api/exerciseTemplatesApi";
import { muscleGroupsApi } from "@/services/api/muscleGroupsApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MuscleGroup {
  id: string;
  name: string;
}

interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  description: string;
  requiresWeight: boolean;
}

const ExerciseList = () => {
  const { toast } = useToast();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseTemplate[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch muscle groups
  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        console.log("Fetching muscle groups...");
        const response = await muscleGroupsApi.getAll();
        console.log("Muscle groups API response:", response);
        if (response?.data) {
          console.log("Setting muscle groups:", response.data);
          setMuscleGroups(response.data);
        } else {
          throw new Error("No muscle groups data received");
        }
      } catch (error) {
        console.error("Failed to fetch muscle groups:", error);
        toast({
          title: "Error",
          description: "Failed to load muscle groups. Please try again.",
          variant: "destructive",
        });
        setError("Failed to load muscle groups. Please try again later.");
      }
    };
    
    fetchMuscleGroups();
  }, [toast]);
  
  // Fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching exercises with muscle group filter:", selectedMuscleGroup);
        let response;
        if (selectedMuscleGroup && selectedMuscleGroup !== "all") {
          response = await exerciseTemplatesApi.getByMuscleGroup(selectedMuscleGroup);
        } else {
          response = await exerciseTemplatesApi.getAll();
        }
        
        console.log("Raw exercises API response:", response);
        
        if (response?.data) {          // Log raw data first
          console.log("Raw API response data:", JSON.stringify(response.data, null, 2));

          // Log each exercise with its properties for debugging
          response.data.forEach((exercise: any, index: number) => {
            console.log(`Exercise ${index} raw data:`, exercise);
            console.log(`Exercise ${index} parsed:`, {
              id: exercise?.id,
              name: exercise?.name,
              primaryMuscleGroup: exercise?.primaryMuscleGroup,
              secondaryMuscleGroup: exercise?.secondaryMuscleGroup,
              description: exercise?.description
            });
          });

          // Don't modify the original data
          const validExercises = response.data.map(exercise => ({
            ...exercise,
            name: exercise.name || 'Unnamed Exercise',
            description: exercise.description || 'No description available',
            muscleGroups: exercise.muscleGroups || []
          }));

          console.log("Processed valid exercises:", validExercises);
          setExercises(validExercises);
          setFilteredExercises(validExercises);
        } else {
          console.error("No data property in API response:", response);
          throw new Error("No exercises data received");
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        toast({
          title: "Error",
          description: "Failed to load exercises. Please try again.",
          variant: "destructive",
        });
        setError("Failed to load exercises. Please try again later.");
        setExercises([]);
        setFilteredExercises([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [selectedMuscleGroup, toast]);
  
  // Filter exercises based on search term
  useEffect(() => {
    if (!exercises.length) {
      console.log("No exercises to filter");
      return;
    }
    
    console.log("Filtering exercises with search term:", searchTerm);
    const filtered = exercises.filter(exercise => {
      if (!searchTerm) return true;
      if (!exercise) return false;
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      const nameMatch = exercise.name?.toLowerCase().includes(lowerSearchTerm) || false;
      const descriptionMatch = exercise.description?.toLowerCase().includes(lowerSearchTerm) || false;
      const muscleGroupMatch = exercise.muscleGroups?.some(group => 
        group.name.toLowerCase().includes(lowerSearchTerm)
      ) || false;
      
      return nameMatch || descriptionMatch || muscleGroupMatch;
    });
    
    console.log("Filtered exercises:", filtered);
    setFilteredExercises(filtered);
  }, [searchTerm, exercises]);
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          <p className="text-muted-foreground">Browse and search available exercises</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-lb-darker w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger className="w-full sm:w-[180px] bg-lb-darker">
              <SelectValue placeholder="Filter by muscle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscle Groups</SelectItem>
              {muscleGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-lb-accent" />
        </div>
      ) : filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            if (!exercise || typeof exercise !== 'object') {
              console.warn("Skipping invalid exercise:", exercise);
              return null;
            }
            
            const {
              id = '',
              name = 'Unnamed Exercise',
              description = 'No description available',
              muscleGroups = []
            } = exercise;
            
            if (!id) {
              console.warn("Skipping exercise without ID:", exercise);
              return null;
            }
            
            return (
              <Link to={`/dashboard/exercises/${id}`} key={id}>
                <Card className="glass-card p-4 hover:translate-y-[-2px] transition-all cursor-pointer">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {muscleGroups.map((group, index) => (
                          <Badge 
                            key={group.id || index}
                            variant="outline" 
                            className={`${index === 0 ? 'bg-lb-accent/10' : 'bg-lb-accent/5'}`}
                          >
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-6">
          <div className="bg-lb-darker rounded-full p-4 inline-flex mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No exercises found</h3>
          <p className="text-muted-foreground">
            {exercises.length === 0
              ? "No exercises available."
              : searchTerm
              ? "Try a different search term"
              : "Try selecting a different muscle group"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;