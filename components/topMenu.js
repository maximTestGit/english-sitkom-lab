import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import './styles/topMenu.module.css';

const TopMenu = ({ onGoHome, onLogin, onLogout, currentUserData }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(currentUserData);

    useEffect(() => {
        setCurrentUser(currentUserData);
    }, [currentUserData]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        let result = await onLogin(userName, password);
        setShowModal(false);
        if (result) {
            alert('Login successful!');
        } else {
            alert('Login failed!');
        }
    };

    const handleLoggInOut = () => {
        if (currentUser?.token) {
            onLogout();
        } else {
            setShowModal(true);
        }
    };
    return (
        <>
            <div className='row bg-light mb-2'>
                <a className="nav-link bold-on-hover col-2 col-md-2" onClick={() => handleLoggInOut()} href="#" rel="noopener noreferrer">
                    {currentUser?.token ? `Logout(${currentUser.username})` : 'Login'}
                </a>
                <a className="nav-link bold-on-hover col-2 col-md-2" onClick={() => onGoHome()} href="#" rel="noopener noreferrer">Home</a>
                <a className="nav-link bold-on-hover col-2 col-md-2" href="https://youtu.be/8q3F7aY1EzU" target="_blank" rel="noopener noreferrer">How to?</a>
                <a className="nav-link bold-on-hover col-2 col-md-2" href="https://www.youtube.com/channel/UCWQGpzzCvnv8y8LyH02E2qw" target="_blank" rel="noopener noreferrer">YouTube</a>
                <a className="nav-link bold-on-hover col-2 col-md-2" href="mailto:sitcom.english.lab@gmail.com">Contact</a>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleLoginSubmit}>
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
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
        </>
    );
};

export default TopMenu;
