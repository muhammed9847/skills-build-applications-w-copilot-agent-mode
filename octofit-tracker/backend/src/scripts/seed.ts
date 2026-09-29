import mongoose from 'mongoose';
import { Types } from 'mongoose';
import {
  ActivityModel,
  LeaderboardModel,
  TeamModel,
  UserModel,
  WorkoutModel,
} from '../models';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';
const upsertOptions = { upsert: true, new: true, setDefaultsOnInsert: true } as const;

async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);

    console.log('Connected to octofit_db');
    console.log('Seed the octofit_db database with test data');

    const userSeeds = [
      { username: 'avery-chen', displayName: 'Avery Chen', email: 'avery.chen@example.com' },
      { username: 'jordan-patel', displayName: 'Jordan Patel', email: 'jordan.patel@example.com' },
      { username: 'morgan-reyes', displayName: 'Morgan Reyes', email: 'morgan.reyes@example.com' },
    ];
    const userIds = new Map<string, Types.ObjectId>();

    for (const userSeed of userSeeds) {
      const user = await UserModel.findOneAndUpdate(
        { email: userSeed.email },
        { $set: userSeed },
        upsertOptions,
      );
      if (!user) throw new Error(`Unable to seed user ${userSeed.username}`);
      userIds.set(userSeed.username, user._id);
    }

    const teamSeeds = [
      { name: 'Morning Miles', members: ['avery-chen', 'jordan-patel'], points: 1480 },
      { name: 'Weekend Striders', members: ['morgan-reyes'], points: 920 },
    ];
    const teamIds = new Map<string, Types.ObjectId>();

    for (const teamSeed of teamSeeds) {
      const members = teamSeed.members.map((username) => userIds.get(username));
      if (members.some((member) => !member)) throw new Error(`Missing member for team ${teamSeed.name}`);

      const team = await TeamModel.findOneAndUpdate(
        { name: teamSeed.name },
        { $set: { ...teamSeed, members } },
        upsertOptions,
      );
      if (!team) throw new Error(`Unable to seed team ${teamSeed.name}`);
      teamIds.set(teamSeed.name, team._id);
    }

    const activitySeeds = [
      { username: 'avery-chen', activityType: 'running', durationMinutes: 38, distanceKm: 6.2, performedAt: new Date('2026-09-25T06:45:00.000Z') },
      { username: 'avery-chen', activityType: 'cycling', durationMinutes: 52, distanceKm: 18.4, performedAt: new Date('2026-09-27T08:15:00.000Z') },
      { username: 'jordan-patel', activityType: 'running', durationMinutes: 31, distanceKm: 5.1, performedAt: new Date('2026-09-26T07:10:00.000Z') },
      { username: 'jordan-patel', activityType: 'strength', durationMinutes: 44, performedAt: new Date('2026-09-28T17:30:00.000Z') },
      { username: 'morgan-reyes', activityType: 'cycling', durationMinutes: 67, distanceKm: 23.7, performedAt: new Date('2026-09-27T09:00:00.000Z') },
    ];

    for (const activitySeed of activitySeeds) {
      const user = userIds.get(activitySeed.username);
      if (!user) throw new Error(`Missing user for activity ${activitySeed.activityType}`);
      const { username: _username, ...activity } = activitySeed;
      await ActivityModel.findOneAndUpdate(
        { user, activityType: activity.activityType, performedAt: activity.performedAt },
        { $set: { ...activity, user } },
        upsertOptions,
      );
    }

    const leaderboardSeeds = [
      { username: 'avery-chen', teamName: 'Morning Miles', points: 860, rank: 1 },
      { username: 'jordan-patel', teamName: 'Morning Miles', points: 620, rank: 2 },
      { username: 'morgan-reyes', teamName: 'Weekend Striders', points: 540, rank: 3 },
    ];

    for (const entry of leaderboardSeeds) {
      const user = userIds.get(entry.username);
      const team = teamIds.get(entry.teamName);
      if (!user || !team) throw new Error(`Missing user or team for ${entry.username}`);
      await LeaderboardModel.findOneAndUpdate(
        { user },
        { $set: { user, team, points: entry.points, rank: entry.rank } },
        upsertOptions,
      );
    }

    const workoutSeeds = [
      {
        title: 'Beginner Endurance Run',
        description: 'A steady aerobic session focused on building a comfortable running base.',
        difficulty: 'beginner',
        durationMinutes: 30,
        exercises: ['5-minute brisk walk', '20-minute easy run', '5-minute cooldown walk'],
      },
      {
        title: 'Full-Body Strength Circuit',
        description: 'A balanced strength session with controlled bodyweight movements.',
        difficulty: 'intermediate',
        durationMinutes: 40,
        exercises: ['Goblet squats', 'Incline push-ups', 'Reverse lunges', 'Plank holds'],
      },
      {
        title: 'Tempo Ride Intervals',
        description: 'A cycling workout alternating sustained tempo efforts with easy recovery.',
        difficulty: 'advanced',
        durationMinutes: 45,
        exercises: ['8-minute warm-up', '3 x 6-minute tempo intervals', '2-minute easy recovery', '7-minute cooldown'],
      },
    ];

    for (const workoutSeed of workoutSeeds) {
      await WorkoutModel.findOneAndUpdate(
        { title: workoutSeed.title },
        { $set: workoutSeed },
        upsertOptions,
      );
    }

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();
