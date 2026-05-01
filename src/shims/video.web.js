import React from 'react';

const Video = ({ source, style, repeat, muted, resizeMode }) => {
  const src = typeof source === 'string' ? source : source?.uri || source;
  return (
    <video
      src={src}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100%',
        objectFit: resizeMode === 'cover' ? 'cover' : 'contain',
        ...style,
      }}
      autoPlay
      loop={repeat}
      muted={muted !== false}
      playsInline
    />
  );
};

export default Video;
