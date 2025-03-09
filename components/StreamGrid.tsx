import { StreamGridProps } from './types';

interface Stream {
    id: string;
    name: string;
    platform: string;
}

const StreamGrid: React.FC<StreamGridProps> = ({ streams, columns = 3 }) => {
    return (
        <div className={`grid grid-cols-${columns}`}>
            {streams.map((stream: Stream) => (
                <div key={stream.id} className="stream-item bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold">{stream.name}</h3>
                    <p className="text-gray-600">{stream.platform}</p>
                </div>
            ))}
        </div>
    );
};

export default StreamGrid;