import React from 'react';
import {Composition} from 'remotion';
import {TippdVideo} from './TippdVideo';
 
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TippdVideo"
        component={TippdVideo}
        durationInFrames={420}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};