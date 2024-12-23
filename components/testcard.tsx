interface EventCardProps {
    event: {
        id: number
        eventName: string,
        description: string,
        location: string,
        startDay: string,
        startDate: string,
        startHour: number,
        endHour: number,
        color: 'coral' | 'yellow'| 'pink' | 'green' | 'blue' | 'purple' | 'teal' | 'gray',
    }
    leftOffset: number; // Percentage value for 'left' position
    width: number;      // Percentage value for 'width'
  }
  
  
  const colorMap = {
      coral: 'bg-orange-200/90 text-orange-950',
      yellow: 'bg-yellow-200/90 text-yellow-950',
      pink: 'bg-pink-200/90 text-pink-950',
      green: 'bg-green-200/90 text-green-950',
      blue: 'bg-blue-200/90 text-blue-950',
      purple: 'bg-purple-200/90 text-purple-950',
      teal: 'bg-teal-200/90 text-teal-950',
      gray: 'bg-gray-200/90 text-gray-950',
    };
  
  export function TestCard({ event, leftOffset, width }: EventCardProps) {
      const fixedOffset = 100 - ((leftOffset / 100) * 100);
      const widthOffset = - ( 100 * (width / 100)); // To offset the 60px at the left occupied by the day labels
  
      return (
          <div
          className={`absolute top-0 h-20 ${colorMap[event.color]} rounded-md p-2 text-xs overflow-hidden`}
          style={{
              left: `calc(${fixedOffset}px + ${leftOffset}%)`, // Adjust for the day label column
              width: `calc(${widthOffset}px + ${width}%)`,   
              zIndex: 1,
          }}
          >
          <div className="font-bold">{event.eventName}</div>
          <div>{event.description}</div>
          <div>{event.location}</div>
          <div className="text-[10px] mt-1 opacity-75">{event.startDate}</div>
          </div>
      );
  }