import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { DashboardService } from './dashboard.services';
import { JwtPayload } from 'jsonwebtoken';



const getUserDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
  const stats = await DashboardService.getUserDashboardStats(req.user as JwtPayload);
  res.status(200).json({
    success: true,
    data: stats
  });
});


export const DashboardController={
    getUserDashboardStats
}