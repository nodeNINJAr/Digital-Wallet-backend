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

const getAgentDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await DashboardService.getAgentDashboardStats(req.user as JwtPayload);
  res.status(200).json({
    success: true,
    data: stats
  });
});


const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await DashboardService.getDashboardStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

// 

const getTransactionTrends = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await DashboardService.getTransactionTrends();
  res.status(200).json({
    success: true,
    data: stats
  });
});


// 
const getTransactionTypes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await DashboardService.getTransactionTypes();
  res.status(200).json({
    success: true,
    data: stats
  });
});


// 
const getRecentActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await DashboardService.getRecentActivity();
  res.status(200).json({
    success: true,
    data: stats
  });
});


export const DashboardController={
    getUserDashboardStats,
    getAgentDashboardStats,
    getDashboardStats,
    getTransactionTrends,
    getTransactionTypes,
    getRecentActivity,
}