"use client";

import { Stream } from "./StreamLayout";

interface StreamViewProps {
  streams: Stream[];
}

export default function StreamView({ streams }: StreamViewProps) {
  if (streams.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Add streams from the sidebar to get started</p>
      </div>
    );
  }

  const gridCols = Math.ceil(Math.sqrt(streams.length));
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    height: "100%",
  };

  return (
    <div style={gridStyle}>
      {streams.map((stream) => (
        <div key={stream.id} className="relative w-full h-full min-h-[300px]">
          {stream.platform === "twitch" ? (
            <iframe
              src={`https://player.twitch.tv/?channel=${stream.channel}&parent=${window.location.hostname}`}
              frameBorder="0"
              allowFullScreen
              scrolling="no"
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <iframe
              src={`https://player.kick.com/${stream.channel}`}
              frameBorder="0"
              allowFullScreen
              scrolling="no"
              className="absolute inset-0 w-full h-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}