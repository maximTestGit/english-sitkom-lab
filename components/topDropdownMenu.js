import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Button, Modal, Form } from 'react-bootstrap';
import { isRunningOnBigScreen, inDebugEnv } from './data/configurator';
import { loadCaptionObjectsFromFile, eventsToSubtitleObjectsFromFile } from './helpers/srtHelper';
import { signInUser, signOutUser, signUpUser } from './gc/firebase';
import { cleanUpLocalStorage } from "./helpers/storageHelper";

const TopDropdownMenu = ({
    user,
    videoData,
    onCustomVideoOpen,
    onExerciseOpen,
    onGoHome,
    onSrtOpen,
    onSrtSave,
    onSrtUpload,
    onReloadPlaylist
}) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [email, setEmail] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Custom Video Open Modal dialog State
    const [isCustomVideoModalOpen, setIsCustomVdeoModalOpen] = useState(false);
    const [customVideoUrl, setCustomVideoUrl] = useState('');
    const [customVideoTitle, Custom] = useState('');

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
    }
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
        setShowModal(false);
        if (theUser) {
            alert(`Hello ${theUser.username}!`);
        } else {
            alert('Login failed!');
        }
    };

    const handleLogin = () => {
        if (!user) {
            setShowModal(true);
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
        let theUser = await signUpUser(userName, email, password);
        setShowRegisterModal(false);
        if (theUser) {
            alert(`Hello ${theUser.username}!`);
        } else {
            alert('Registration failed!');
        }
        // setUserName('');
        // setPassword('');
        // setEmail('');
    };

    const handleHome = () => { onGoHome(); };
    const handleYoutube = () => {
        window.open('https://www.youtube.com/channel/UCWQGpzzCvnv8y8LyH02E2qw', '_blank');
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
    }
    const handleSrtUpload = () => {
        if (onSrtUpload) {
            onSrtUpload();
        }
    };

    const handleOpenCustomVideo = () => {
        setIsCustomVdeoModalOpen(true);
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
        //window.location.reload();
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
    return (
        <>
            <Navbar bg="light" expand="sm">
                <Navbar.Brand href="#">{user ? `Hello ${user.username ?? user.email}` : 'Hello Guest'}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* Account Dropdown */}
                        {!user && (
                            <NavDropdown title="Account" id="account-dropdown">
                                <NavDropdown.Item onClick={handleLogin}>Login</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleRegister}>Register</NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {user && (
                            <NavDropdown title="Account" id="account-dropdown">
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        )}

                        {/* File Dropdown */}
                        {(user || inDebugEnv) && isRunningOnBigScreen && videoData && (
                            < NavDropdown title="File" id="File-dropdown">
                                <NavDropdown.Item onClick={handleSrtSave}>Save .srt</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleSrtOpen}>Open .srt</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleSrtUpload}>Upload .srt</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleOpenJsonSrt}>Open .json</NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {/* Subtitles Dropdown */}
                        {user && !videoData && (
                            < NavDropdown title="Tools" id="tools-dropdown">
                                <NavDropdown.Item onClick={handleOpenCustomVideo}>Open custom video</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleExerciseOpen}>Open Exercise File</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleReloadPlaylist}>Reload Playlist</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleCleanupMem}>Clear Memory</NavDropdown.Item>
                                </NavDropdown>
                        )}
                        {/* Navigate Dropdown */}
                        <NavDropdown title="Navigate" id="navigate-dropdown">
                            <NavDropdown.Item onClick={handleHome}>Home</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleYoutube}>Youtube</NavDropdown.Item>
                        </NavDropdown>

                        {/* About Dropdown */}
                        <NavDropdown title="About" id="about-dropdown">
                        <NavDropdown.Item onClick={handleHowTo}>How To?</NavDropdown.Item>
                        <NavDropdown.Item onClick={handleHowToSignup}>How To Register(Free)?</NavDropdown.Item>
                        <NavDropdown.Item onClick={handleContactMe}>Contact Me</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar >
            <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                        <Button variant="primary" type="submit">
                            Register
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
