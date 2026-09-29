import { Router, type Request, type Response } from 'express';
import type { Model } from 'mongoose';
import {
  ActivityModel,
  LeaderboardModel,
  TeamModel,
  UserModel,
  WorkoutModel,
} from '../models';

function createCollectionRouter<T>(resource: Model<T>): Router {
  const router = Router();

  router.get('/', async (_request: Request, response: Response) => {
    response.json(await resource.find().lean());
  });

  router.post('/', async (request: Request, response: Response) => {
    const document = await resource.create(request.body);
    response.status(201).json(document);
  });

  return router;
}

const apiRouter = Router();

apiRouter.use('/users', createCollectionRouter(UserModel));
apiRouter.use('/teams', createCollectionRouter(TeamModel));
apiRouter.use('/activities', createCollectionRouter(ActivityModel));
apiRouter.use('/leaderboard', createCollectionRouter(LeaderboardModel));
apiRouter.use('/workouts', createCollectionRouter(WorkoutModel));

export default apiRouter;