interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    location: string;
    weeks: number[];
    startHour: number;
    endHour: number;
    startMinutes: number;
    endMinutes: number;
    day: number;
    color: 'coral' | 'yellow'| 'pink' | 'green' | 'blue' | 'purple' | 'teal' | 'gray' | 'rose';

  }; // Event data
  leftOffset: number; // Percentage value for 'left' position
  width: number;      // Percentage value for 'width'
}


const colorMap = {
    coral: 'bg-orange-200 text-orange-950',
    yellow: 'bg-yellow-200 text-yellow-950',
    pink: 'bg-pink-200 text-pink-950',
    green: 'bg-green-200 text-green-950',
    blue: 'bg-blue-200 text-blue-950',
    purple: 'bg-purple-200 text-purple-950',
    teal: 'bg-teal-200 text-teal-950',
    gray: 'bg-gray-200 text-gray-950',
    rose: 'bg-rose-200 text-rose-950',
  };

export function EventCard({ event, leftOffset, width }: EventCardProps) {
    const fixedOffset = 60 - ((leftOffset / 100) * 60);
    const widthOffset = -( 60 * (width / 100)); // To offset the 60px at the left occupied by the day labels

    return (
        <div
        className={`absolute top-0 h-20 ${colorMap[event.color]} rounded-md p-2 text-xs overflow-hidden`}
        style={{
          left: `calc(${fixedOffset}px + ${leftOffset}% + 1px)`, // Adjust for the day label column
            width: `calc(${widthOffset}px + ${width}% - 1px)`, // 1px is to make it fit inside the grid   
            zIndex: 1,
        }}
        >
        <div className="font-bold">{event.name}</div>
        <div>{event.description}</div>
        <div>{event.location}</div>
        <div className="text-[10px] mt-1">Weeks {event.weeks[0]} - {event.weeks[event.weeks.length - 1]}</div>
        </div>
    );
}