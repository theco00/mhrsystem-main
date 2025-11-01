import { useState } from 'react';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export const useTimeRange = (initialRange: TimeRange = '30d') => {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);

  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case '7d': return '7 dias';
      case '30d': return '30 dias';
      case '90d': return '90 dias';
      case '1y': return '1 ano';
      default: return range;
    }
  };

  const getTimeRangeInDays = (range: TimeRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  return {
    timeRange,
    setTimeRange,
    getTimeRangeLabel,
    getTimeRangeInDays
  };
};