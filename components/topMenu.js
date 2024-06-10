import React from 'react';
import './styles/topMenu.module.css';

const TopMenu = ({onGoHome}) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <a className="nav-link nav-link-hover" onClick={()=>onGoHome()} href="" target="_blank" rel="noopener noreferrer">Home</a>
                    </li>
                    <li>
                        <a className="nav-link nav-link-hover" href="https://www.youtube.com/channel/UCWQGpzzCvnv8y8LyH02E2qw" target="_blank" rel="noopener noreferrer">YouTube Channel</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link nav-link-hover" href="mailto:sitcom.english.lab@gmail.com">Contact Developer</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link nav-link-hover" href="#about">About</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default TopMenu;
