import React from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';

const BlurringPanel = ({
    zIndex = 1,
    bottom = 0,
    startLeft = 0,
    width = '200px',
    height = '200px',
    backgroundColor = 'rgba(255, 255, 255, 0.8)',
    backdropFilter = 'blur(5px)',
    hint = undefined
}) => {
    return (
        <Draggable>
            <div
                style={{
                    position: 'absolute',
                    bottom: bottom,
                    left: startLeft,
                    width: width,
                    height: height,
                    backgroundColor: backgroundColor,
                    backdropFilter: backdropFilter,
                    zIndex: zIndex,
                    //cursor: 'move',
                }}>
                <p style={{ color: 'white', textAlign: 'right', position: 'absolute', bottom: '0', right: '0', fontStyle: 'italic' }}>
                    {hint ? hint : ""}
                </p>            
            </div>
        </Draggable>
    );
};

BlurringPanel.propTypes = {
    zIndex: PropTypes.number,
    bottom: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    startLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    startRight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    backgroundColor: PropTypes.string,
    backdropFilter: PropTypes.string,
};

export default BlurringPanel;
