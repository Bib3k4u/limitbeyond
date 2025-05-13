package com.limitbeyond.dto.workout;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.limitbeyond.dto.exercise.ExerciseTemplateResponse;
import com.limitbeyond.model.Workout;
import com.limitbeyond.model.WorkoutSet;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class WorkoutResponse {
    private String id;
    private String name;
    private String description;
    private UserSummary member;
    private UserSummary trainer;
    private List<WorkoutSetResponse> sets;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedDate;

    private boolean completed;
    private String notes;

    // Nested class for user summary
    public static class UserSummary {
        private String id;
        private String username;
        private String firstName;
        private String lastName;

        public UserSummary(String id, String username, String firstName, String lastName) {
            this.id = id;
            this.username = username;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    // Nested class for workout set response
    public static class WorkoutSetResponse {
        private String id;
        private ExerciseTemplateResponse exercise;
        private int reps;
        private Double weight;
        private String notes;
        private boolean completed;

        public static WorkoutSetResponse fromWorkoutSet(WorkoutSet set) {
            WorkoutSetResponse response = new WorkoutSetResponse();
            response.setId(set.getId());
            response.setExercise(new ExerciseTemplateResponse(set.getExercise()));
            response.setReps(set.getReps());
            response.setWeight(set.getWeight());
            response.setNotes(set.getNotes());
            response.setCompleted(set.isCompleted());
            return response;
        }

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public ExerciseTemplateResponse getExercise() {
            return exercise;
        }

        public void setExercise(ExerciseTemplateResponse exercise) {
            this.exercise = exercise;
        }

        public int getReps() {
            return reps;
        }

        public void setReps(int reps) {
            this.reps = reps;
        }

        public Double getWeight() {
            return weight;
        }

        public void setWeight(Double weight) {
            this.weight = weight;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public boolean isCompleted() {
            return completed;
        }

        public void setCompleted(boolean completed) {
            this.completed = completed;
        }
    }

    // Factory method to create response from model
    public static WorkoutResponse fromWorkout(Workout workout) {
        WorkoutResponse response = new WorkoutResponse();
        response.setId(workout.getId());
        response.setName(workout.getName());
        response.setDescription(workout.getDescription());

        if (workout.getMember() != null) {
            response.setMember(new UserSummary(
                    workout.getMember().getId(),
                    workout.getMember().getUsername(),
                    workout.getMember().getFirstName(),
                    workout.getMember().getLastName()));
        }

        if (workout.getTrainer() != null) {
            response.setTrainer(new UserSummary(
                    workout.getTrainer().getId(),
                    workout.getTrainer().getUsername(),
                    workout.getTrainer().getFirstName(),
                    workout.getTrainer().getLastName()));
        }

        List<WorkoutSetResponse> setResponses = new ArrayList<>();
        for (WorkoutSet set : workout.getSets()) {
            setResponses.add(WorkoutSetResponse.fromWorkoutSet(set));
        }
        response.setSets(setResponses);

        response.setScheduledDate(workout.getScheduledDate());
        response.setCompletedDate(workout.getCompletedDate());
        response.setCompleted(workout.isCompleted());
        response.setNotes(workout.getNotes());

        return response;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserSummary getMember() {
        return member;
    }

    public void setMember(UserSummary member) {
        this.member = member;
    }

    public UserSummary getTrainer() {
        return trainer;
    }

    public void setTrainer(UserSummary trainer) {
        this.trainer = trainer;
    }

    public List<WorkoutSetResponse> getSets() {
        return sets;
    }

    public void setSets(List<WorkoutSetResponse> sets) {
        this.sets = sets;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
