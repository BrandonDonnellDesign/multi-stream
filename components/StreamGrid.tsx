const StreamGrid: React.FC<StreamGridProps> = ({ streams, columns = 3 }) => {
    return (
        <div className={`grid grid-cols-${columns}`}>
            {streams.map(stream => (
                <div key={stream.id} className="stream-item">
                    <h3>{stream.name}</h3>
                    <p>{stream.platform}</p>
                </div>
            ))}
        </div>
    );
}; 