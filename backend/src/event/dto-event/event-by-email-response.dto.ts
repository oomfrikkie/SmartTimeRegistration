export class EventByEmailResponseDto {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  date: string;
  total_hours: number;
  account: {
    email: string;
  };
}
