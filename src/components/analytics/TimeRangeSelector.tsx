import { Button } from '@/components/ui/button';
import { useTimeRange, TimeRange } from '@/hooks/useTimeRange';

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ timeRange, onTimeRangeChange }: TimeRangeSelectorProps) {
  const { getTimeRangeLabel } = useTimeRange(timeRange);

  const ranges: TimeRange[] = ['7d', '30d', '90d', '1y'];

  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <Button
          key={range}
          variant={timeRange === range ? "default" : "outline"}
          size="sm"
          onClick={() => onTimeRangeChange(range)}
        >
          {getTimeRangeLabel(range)}
        </Button>
      ))}
    </div>
  );
}