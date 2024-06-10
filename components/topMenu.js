import React from 'react';
import './styles/topMenu.module.css';

const TopMenu = ({ onGoHome }) => {
    return (
        <div className='row bg-light'>
            <a className="nav-link bold-on-hover col-2 col-md-2" onClick={() => onGoHome()} href="" target="" rel="noopener noreferrer">Home</a>
            <a className="nav-link bold-on-hover col-3 col-md-2" href="https://www.youtube.com/channel/UCWQGpzzCvnv8y8LyH02E2qw" target="_blank" rel="noopener noreferrer">YouTube Channel</a>
            <a className="nav-link bold-on-hover col-3 col-md-2" href="mailto:sitcom.english.lab@gmail.com">Contact Developer</a>
        </div>
    );
};

export default TopMenu;