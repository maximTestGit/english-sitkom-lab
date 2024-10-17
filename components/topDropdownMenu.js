import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Button, Modal, Form } from 'react-bootstrap';
import { 
    isRunningOnBigScreen, 
    inDebugEnv, 
    languages ,
    loginoutEvents,
} 
from './data/configurator';
import { loadCaptionObjectsFromFile, eventsToSubtitleObjectsFromFile } from './helpers/srtHelper';
import { signInUser, signOutUser, signUpUser } from './gc/firebase';
import { cleanUpLocalStorage } from "./helpers/storageHelper";
import { t, Trans } from '@lingui/macro';

const TopDropdownMenu = ({
    user,
    videoData,
    onCustomVideoOpen,
    onExerciseOpen,
    onGoHome,
    onSrtOpen,
    onSrtSave,
    onSrtUpload,
    onReloadPlaylist,
    onSavePlaylist,
    onLearningLanguageChange,
    onLoginLogout
}) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [email, setEmail] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState('en-US');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isCustomVideoModalOpen, setIsCustomVdeoModalOpen] = useState(false);
    const [customVideoUrl, setCustomVideoUrl] = useState('');
    const [customVideoTitle, Custom] = useState('');
    const [playlistId, setPlaylistId] = useState('');
    const [playlistName, setPlaylistName] = useState('');
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [newLearningLanguage, setNewLearningLanguage] = useState('');

    const handleCleanupMem = () => {
        cleanUpLocalStorage(true);
    };

    const handleExerciseOpen = () => {
        let fileName;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                fileName = file.name;
                console.log('Selected file:', fileName);
                openExercise(file);
            }
        };
        input.click();
    };

    const openExercise = (file) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const contents = event.target.result;
            try {
                const exercise = JSON.parse(contents);
                onExerciseOpen(exercise);
            } catch (e) {
                console.error('Could not parse JSON: ', e);
            }
        };
        reader.readAsText(file);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        let theUser = await signInUser(email, password);
        setShowLoginModal(false);
        if (theUser) {
            onLoginLogout(loginoutEvents.LOGIN_SUCCESS, theUser.username, theUser.language);
        } else {
            onLoginLogout(loginoutEvents.LOGIN_SUCCESS, 'Guest');
        }
    };

    const handleLogin = () => {
        if (!user) {
            setShowLoginModal(true);
            onGoHome();
        }
    };

    const handleLogout = () => {
        if (user) {
            signOutUser();
            onGoHome();
        }
    };

    const handleRegister = () => {
        if (!user) {
            setShowRegisterModal(true);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (password !== verifyPassword) {
            alert("Passwords do not match!");
            return;
        }
        console.log('Register:', userName, email, password);
        let theUser = await signUpUser(userName, email, password, selectedLanguage);
        setShowRegisterModal(false);
        if (theUser) {
            onLoginLogout(loginoutEvents.REGISTER_SUCCESS, theUser.username, selectedLanguage);
        } else {
            onLoginLogout(loginoutEvents.REGISTER_ERROR, userName, selectedLanguage);
        }
    };

    const handleHome = () => { onGoHome(); };
    const handleYoutube = () => {
        window.open('https://www.youtube.com/channel/UCWQGpzzCvnv8y8LyH02E2qw', '_blank');
    };

    const handleVideoYoutube = () => {
        window.open(`https://youtu.be/${videoData.videoId}`, '_blank');
    };

    const handleHowTo = () => {
        window.open('https://youtu.be/8q3F7aY1EzU', '_blank');
    };

    const handleHowToSignup = () => {
        window.open('https://youtu.be/RDhzSjIIu4Q', '_blank');
    };

    const handleContactMe = () => {
        window.open('mailto:sitcom.english.lab@gmail.com', '_blank');
    };

    const handleSrtSave = () => {
        if (onSrtSave) {
            onSrtSave();
        }
    };

    const handleSrtOpen = () => {
        let fileName;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.srt';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                fileName = file.name;
                console.log('Selected file:', fileName);
                let captionsObject = await loadCaptionObjectsFromFile(file)
                if (onSrtOpen) {
                    onSrtOpen(captionsObject);
                }
            }
        };
        input.click();
    };

    const handleSrtUpload = () => {
        if (onSrtUpload) {
            onSrtUpload();
        }
    };

    const handleOpenCustomVideo = () => {
        setIsCustomVdeoModalOpen(true);
    };

    const handleSavePlaylist = () => {
        setShowPlaylistModal(true);
    };

    const handlePlaylistSubmit = async (e) => {
        e.preventDefault();
        if (onSavePlaylist) {
            await onSavePlaylist(playlistId, playlistName);
            setPlaylistId('');
            setPlaylistName('');
        }
        setShowPlaylistModal(false);
    };

    const handleOpenVideoLinkClose = () => {
        setIsCustomVdeoModalOpen(false);
        setCustomVideoUrl('');
    };

    const handleOpenVideo = () => {
        onCustomVideoOpen(customVideoUrl, customVideoTitle);
        handleOpenVideoLinkClose();
    };

    const handleReloadPlaylist = () => {
        onReloadPlaylist();
    };

    const handleOpenJsonSrt = () => {
        let fileName;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                fileName = file.name;
                console.log('Selected file:', fileName);
                let captionsObject = await eventsToSubtitleObjectsFromFile(file)
                if (onSrtOpen) {
                    onSrtOpen(captionsObject);
                }
            }
        };
        input.click();
    };

    const setPlaylistIdWrapper = (value) => {
        const playlistId = extractPlaylistId(value);
        setPlaylistId(playlistId);
    };
    function extractPlaylistId(value) {
        // Regular expression to match full YouTube URLs with a playlist ID
        const urlRegex = /[?&]list=([a-zA-Z0-9_-]+)/;

        // Check if the input is already in the format of a playlist ID
        const isId = /^[a-zA-Z0-9_-]+$/.test(value);

        if (isId) {
            return value;
        }

        // If it's a URL, match the playlist ID
        const match = value.match(urlRegex);
        return match ? match[1] : null;
    }

    const handleOpenSettings = () => {
        setShowSettingsModal(true);
    };

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        console.log('Selected Learning Language:', newLearningLanguage);
        setShowSettingsModal(false);
        onLearningLanguageChange(newLearningLanguage);
    };

    const handleSettingsClose = () => {
        setShowSettingsModal(false);
    };

    return (
        <>
            <Navbar bg="light" expand="sm">
                <Navbar.Brand href="#">
                    <Trans>Hello</Trans>{user ?
                        ` ${user.username ?? user.email}` :
                        ' Guest'}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {!user && (
                            <NavDropdown title={<Trans>Account</Trans>} id="account-dropdown">
                                <NavDropdown.Item onClick={handleLogin}><Trans>Login</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleRegister}><Trans>Register</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {user && (
                            <NavDropdown title={<Trans>Account</Trans>} id="account-dropdown">
                                <NavDropdown.Item onClick={handleLogout}><Trans>Logout</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {(user || inDebugEnv) && isRunningOnBigScreen && videoData && (
                            < NavDropdown title={<Trans>File</Trans>} id="File-dropdown">
                                <NavDropdown.Item onClick={handleSrtSave}><Trans>Save .srt</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleSrtOpen}><Trans>Open .srt</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleSrtUpload}><Trans>Upload .srt</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleOpenJsonSrt}><Trans>Open .json</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {user && !videoData && (
                            < NavDropdown title={<Trans>Tools</Trans>} id="tools-dropdown">
                                <NavDropdown.Item onClick={handleOpenSettings}><Trans>Open Settings</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleOpenCustomVideo}><Trans>Open custom video</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleSavePlaylist}><Trans>Add custom Playlist</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleExerciseOpen}><Trans>Open Exercise File</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleReloadPlaylist}><Trans>Reload Playlist</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleCleanupMem}><Trans>Clear Memory</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {!user && !videoData && (
                            < NavDropdown title={<Trans>Tools</Trans>} id="tools-dropdown">
                                <NavDropdown.Item onClick={handleOpenSettings}><Trans>Open Settings</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {!videoData && (
                            <NavDropdown title={<Trans>Navigate</Trans>} id="navigate-dropdown">
                                <NavDropdown.Item onClick={handleHome}><Trans>Home</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleYoutube}><Trans>Youtube</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {videoData && (
                            <NavDropdown title={<Trans>Navigate</Trans>} id="navigate-dropdown">
                                <NavDropdown.Item onClick={handleHome}><Trans>Home</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleYoutube}><Trans>Youtube</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleVideoYoutube}><Trans>Open video on Youtube</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        <NavDropdown title={<Trans>About</Trans>} id="about-dropdown">
                            <NavDropdown.Item onClick={handleHowTo}><Trans>How To?</Trans></NavDropdown.Item>
                            <NavDropdown.Item onClick={handleHowToSignup}><Trans>How To Register(Free)?</Trans></NavDropdown.Item>
                            <NavDropdown.Item onClick={handleContactMe}><Trans>Contact Me</Trans></NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar >
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleLoginSubmit}>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Login
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Register</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleRegisterSubmit}>
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Verify Password</Form.Label>
                            <Form.Control type="password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>My Language</Form.Label>
                            <Form.Control as="select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} required>
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Register
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal show={showPlaylistModal} onHide={() => setShowPlaylistModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Save Playlist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePlaylistSubmit}>
                        <Form.Group>
                            <Form.Label>Playlist ID</Form.Label>
                            <Form.Control type="text" value={playlistId} onChange={(e) => setPlaylistIdWrapper(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Playlist Name</Form.Label>
                            <Form.Control type="text" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal show={showSettingsModal} onHide={handleSettingsClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSettingsSubmit}>
                        <Form.Group>
                            <Form.Label>Learning Language</Form.Label>
                            <Form.Control as="select" value={newLearningLanguage} onChange={(e) => setNewLearningLanguage(e.target.value)} required>
                                <option value="">Select a language</option>
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name} / {lang.nativeName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            {isCustomVideoModalOpen && (
                <div className="modal" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Open Video</h5>
                                <button type="button" className="btn-close" onClick={handleOpenVideoLinkClose}></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Enter video title"
                                    value={customVideoTitle}
                                    onChange={(e) => Custom(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter video URL"
                                    value={customVideoUrl}
                                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleOpenVideoLinkClose}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleOpenVideo}>Open</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopDropdownMenu;