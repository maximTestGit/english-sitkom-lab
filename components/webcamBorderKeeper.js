import React from 'react';

const WebcamBorderKeeper = (zIndex) => (
    <>
        <div id="WebcamHideLeftArea" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 74,
            height: 160,
            backgroundColor: 'white',
            zIndex: {zIndex}
        }} />
        <div id="WebcamHideTopArea" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 200,
            height: 15,
            backgroundColor: 'white',
            zIndex: {zIndex}
        }} />
    </>
);

export default WebcamBorderKeeper;