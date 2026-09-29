import { model, models, Schema, Types, type Model } from 'mongoose';

interface User {
  username: string;
  displayName: string;
  email: string;
}

interface Team {
  name: string;
  members: Types.ObjectId[];
  points: number;
}

interface Activity {
  user: Types.ObjectId;
  activityType: string;
  durationMinutes: number;
  distanceKm?: number;
  performedAt: Date;
}

interface LeaderboardEntry {
  user: Types.ObjectId;
  team?: Types.ObjectId;
  points: number;
  rank: number;
}

interface Workout {
  title: string;
  description: string;
  difficulty: string;
  durationMinutes: number;
  exercises: string[];
}

export const UserModel = (models.User as Model<User> | undefined)
  ?? model<User>('User', new Schema<User>({
    username: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  }, { timestamps: true }));

export const TeamModel = (models.Team as Model<Team> | undefined)
  ?? model<Team>('Team', new Schema<Team>({
    name: { type: String, required: true, trim: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    points: { type: Number, default: 0, min: 0 },
  }, { timestamps: true }));

export const ActivityModel = (models.Activity as Model<Activity> | undefined)
  ?? model<Activity>('Activity', new Schema<Activity>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    distanceKm: { type: Number, min: 0 },
    performedAt: { type: Date, default: Date.now },
  }, { timestamps: true }));

export const LeaderboardModel = (models.LeaderboardEntry as Model<LeaderboardEntry> | undefined)
  ?? model<LeaderboardEntry>('LeaderboardEntry', new Schema<LeaderboardEntry>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    points: { type: Number, required: true, min: 0 },
    rank: { type: Number, required: true, min: 1 },
  }, { timestamps: true }));

export const WorkoutModel = (models.Workout as Model<Workout> | undefined)
  ?? model<Workout>('Workout', new Schema<Workout>({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    exercises: { type: [String], default: [] },
  }, { timestamps: true }));