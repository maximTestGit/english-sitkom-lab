import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Navbar, Nav, NavDropdown, Button, Modal, Form } from 'react-bootstrap';
import {
    isRunningOnBigScreen,
    inDebugEnv,
    languages,
    loginoutEvents,
    extractCulture,
    currentVersion,
    getHelpUrl
}
    from './data/configurator';
import { loadCaptionObjectsFromFile, eventsToSubtitleObjectsFromFile } from './helpers/srtHelper';
import { signInUser, signOutUser, signUpUser } from './gc/firebase';
import { cleanUpLocalStorage } from "./helpers/storageHelper";
import { t, Trans } from '@lingui/macro';
import {
    getFlashcardsCollection,
    updateFlashcardResult,
    updateFlashcardData,
    deleteFlashcard
} from './helpers/fetchData';
import FlashcardExam from './flashcardExam';
import FlashcardEditor from './flashcardEditor';
import RootBinyanTenseTableDrill from './drills/hebrew/rootBinyanTenseTableDrill';
import RootBinyanTenseTransDrill from './drills/hebrew/rootBinyanTenseTransDrill';
import { saveAs } from 'file-saver'; // Make sure to install file-saver package
import {
    getTranslation,
    saveTextToFlashcards,
} from './helpers/fetchData';

const TopDropdownMenu = ({
    user,
    videoData,
    learningLanguage,
    uiLanguage,
    onCustomVideoOpen,
    onExerciseOpen,
    onGoHome,
    onSrtOpen,
    onSrtSave,
    onSrtUpload,
    onReloadPlaylist,
    onSavePlaylist,
    onLearningLanguageChange,
    onUILanguageChange,
    onLoginLogout,
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
    const [newLearningLanguage, setNewLearningLanguage] = useState(learningLanguage);
    const [newUILanguage, setNewUILanguage] = useState(uiLanguage);
    const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
    const [flashcards, setFlashcards] = useState([]);
    const [showFlashcardExamViewModal, setShowFlashcardExamViewModal] = useState(false);
    const [showRootBinyanTenseViewModal, setShowRootBinyanTenseViewModal] = useState(false);
    const [showRootBinyanTenseTransViewModal, setShowRootBinyanTenseTransViewModal] = useState(false);
    const [examCards, setExamCards] = useState([]);
    const [examAnswers, setExamAnswers] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');
    const [filterText, setFilterText] = useState('');


    useEffect(() => {
        setNewLearningLanguage(learningLanguage);
        setNewUILanguage(uiLanguage);
    }, [learningLanguage, uiLanguage]);

    const isSelectedCulture = (lang, uiCulture) => {
        const result = extractCulture(lang) === uiCulture;
        return result;
    };
    const setNewUILanguageWrapper = (lang) => {
        setNewUILanguage(lang);
    };
    const extractCultureWrapper = (lang) => {
        const result = extractCulture(lang);
        return result;
    };
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
        }
        onGoHome();
        onLoginLogout(loginoutEvents.LOGOUT_SUCCESS, 'Guest');
    };

    const handleRegister = () => {
        if (!user) {
            setShowRegisterModal(true);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (password !== verifyPassword) {
            Swal.fire({
                title: 'Error',
                text: 'Passwords do not match!',
                icon: 'error',
                confirmButtonText: 'OK'
            });
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

    const handleAbout = () => {
        const helpUrl = getHelpUrl(uiLanguage);
        window.open(helpUrl, '_blank');
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
        console.log(`Selected Learning Language:${newLearningLanguage}/${learningLanguage}, uiLanguage:${newUILanguage}/${uiLanguage}`);
        setShowSettingsModal(false);
        onLearningLanguageChange(newLearningLanguage);
        onUILanguageChange(newUILanguage);
    };

    const handleSettingsClose = () => {
        setShowSettingsModal(false);
    };

    function normalizeFlashcardsCollection(flashcardsCollection) {
        return flashcardsCollection.map(flashcard => {
            return {
                ...flashcard,
                created: flashcard.created ?
                    (new Date(flashcard.created._seconds * 1000 +
                        flashcard.created._nanoseconds / 1000000))
                        .toDateString() :
                    null,
                lastReviewed: flashcard.lastReviewed ?
                    (new Date(flashcard.lastReviewed._seconds * 1000 +
                        flashcard.lastReviewed._nanoseconds / 1000000))
                        .toDateString() :
                    null,
                nextReview: flashcard.nextReview ?
                    (new Date(flashcard.nextReview._seconds * 1000 +
                        flashcard.nextReview._nanoseconds / 1000000))
                        .toDateString() :
                    null,
            };
        });
    }


    const handleFlashcardsCollectionView = async () => {
        document.body.style.cursor = 'wait';
        try {
            const flashcardsCollection = await getFlashcardsCollection(user, extractCulture(learningLanguage));
            const newFlashcards = normalizeFlashcardsCollection(flashcardsCollection);
            setFlashcards(newFlashcards);
            console.log('Flashcards Collection:', flashcardsCollection);
            setShowFlashcardsModal(true)
        } finally {
            document.body.style.cursor = 'default';
        }
    }
    const handleFlashcardsCollectionViewClose = () => {
        setFlashcards([]);
        setShowFlashcardsModal(false);
    };
    const handleShowRootBinyanTenseTableDrilView = () => {
        setShowRootBinyanTenseViewModal(true);
    };
    const handleShowRootBinyanTenseTableDrillClose = () => {
        setShowRootBinyanTenseViewModal(false);
    };

    const handleShowRootBinyanTenseTransDrilView = () => {
        setShowRootBinyanTenseTransViewModal(true);
    };
    const handleShowRootBinyanTenseTransDrillClose = () => {
        setShowRootBinyanTenseTransViewModal(false);
    };

    const handleFlashcardsCollectionSession = async () => {
        document.body.style.cursor = 'wait';
        try {
            const flashcardsCollection = await getFlashcardsCollection(user, extractCulture(learningLanguage), 10);
            const newFlashcards = normalizeFlashcardsCollection(flashcardsCollection);
            setFlashcards(newFlashcards);
            console.log('Flashcards Collection:', flashcardsCollection);
            const cards = flashcardsCollection.map(flashcard => {
                return {
                    cardId: flashcard.cardId,
                    front: flashcard.front,
                    back: flashcard.back,
                    language: flashcard.frontLanguage,
                    videoId: flashcard.videoId,
                    seconds: flashcard.seconds
                };
            });
            setExamCards(cards);
            setExamAnswers(cards.map(card => ({ cardId: card.cardId, iKnowIt: false })));
            setShowFlashcardExamViewModal(true);
        } finally {
            document.body.style.cursor = 'default';
        }
    };
    const handleIKnowIt = (cardId, isCorrect) => {
        let card = examAnswers.find(answer => answer.cardId === cardId);
        card.iKnowIt = isCorrect;
    };

    function addWordIStillDontKnow(examAnswers, examCards) {
        const cards = examCards.map(card => {
            const answer = examAnswers.find(answer => answer.cardId === card.cardId);
            if (!answer) {
                return {
                    cardId: card.cardId,
                    iKnowIt: false
                };
            } else {
                return {
                    cardId: card.cardId,
                    iKnowIt: answer.iKnowIt
                };
            }
        });
        setExamAnswers(cards);
    }
    const handleFlashcardExamViewClose = () => {
        addWordIStillDontKnow(examAnswers, examCards);
        examAnswers.forEach(card => {
            updateFlashcardResult(user, card.cardId, card.iKnowIt);
        });
        setExamCards([]);
        setShowFlashcardExamViewModal(false);
    };

    function handleSaveFlashcard(card) {
        console.log('Save Flashcard:', card);
        updateFlashcardData(user, card);
    }
    function handleDeleteFlashcard(card) {
        console.log('Delete Flashcard:', card);
        deleteFlashcard(user, card);
        setFlashcards(flashcards.filter(flashcard => flashcard.cardId !== card.cardId));
    }
    function handleRootBinyanTenseTableDrill() {
        onRootBinyanTenseTableDrillOpen();
    }

    const handleExportToCSV = () => {
        if (!filteredFlashcards || filteredFlashcards.length === 0) return;

        const csvContent = filteredFlashcards.map(flashcard => `${flashcard.front},${flashcard.back}`).join('\n');
        const bom = '\uFEFF'; // Byte Order Mark for UTF-8
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'flashcards.csv');
    };

    const handleFlashcardsAddNewCardView = async () => {
        document.body.style.cursor = 'wait';
        try {
            const flashcardsCollection = await getFlashcardsCollection(user, extractCulture(learningLanguage));
            const newFlashcards = normalizeFlashcardsCollection(flashcardsCollection);
            setFlashcards(newFlashcards);
            console.log('Flashcards Collection:', flashcardsCollection);
            showAddCardModalForm();
            setShowAddCardModal(true)
        } finally {
            document.body.style.cursor = 'default';
        }
    }

    const handleAddCardConfirm = async () => {
        //const newCard = { front: newCardFront, back: '' };
        //setFlashcards([...flashcards, newCard]);
        const frontLanguage = extractCulture(learningLanguage);
        await saveTextToFlashcards(user, newCardFront, frontLanguage, uiLanguage, null, null, null, newCardBack);
        setShowAddCardModal(false);
        setNewCardFront('');
    };
    function closeAddFlascardView() {
        setShowAddCardModal(false);
    }

    const translateFlashcard = async (front, back) => {
        if (front) {
            const fromLanguage = extractCulture(learningLanguage);
            const translatedText = await getTranslation(user, front, fromLanguage, uiLanguage);
            setNewCardBack(translatedText);
        } else if (back) {
            const toLanguage = extractCulture(learningLanguage);
            const translatedText = await getTranslation(user, back, uiLanguage, toLanguage);
            setNewCardFront(translatedText);
        }
    }

    const handleFilterChange = (e) => {
        setFilterText(e.target.value);
    };

    const filteredFlashcards = flashcards.filter(flashcard =>
        flashcard.front.toLowerCase().includes(filterText.toLowerCase()) ||
        flashcard.back.toLowerCase().includes(filterText.toLowerCase())
    );
    const showAddCardModalForm = () => {
        setNewCardBack(null);
        setNewCardFront(null);
    }
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
                    {!user && (
                        <NavDropdown title={<Trans>Site language</Trans>} id="site-language-dropdown">
                            {languages.map(lang => (
                                <NavDropdown.Item key={lang.code} onClick={() => onUILanguageChange(lang.code)}>
                                    {lang.name}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                    )}
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
                                <NavDropdown.Item onClick={handleSrtUpload}><Trans>Upload .srt to Server</Trans></NavDropdown.Item>
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
                        {user && (
                            < NavDropdown title={<Trans>Flashcards</Trans>} id="tools-dropdown">
                                <NavDropdown.Item onClick={handleFlashcardsCollectionView}><Trans>View Colection</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleFlashcardsCollectionSession}><Trans>Start Test</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleFlashcardsAddNewCardView}><Trans>Add Flashcard</Trans></NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {user && learningLanguage === 'he-IL' && (
                            < NavDropdown title={<Trans>Drils</Trans>} id="tools-dropdown">
                                <NavDropdown.Item onClick={handleShowRootBinyanTenseTableDrilView}><Trans>Root/Binyan/Tense</Trans></NavDropdown.Item>
                                <NavDropdown.Item onClick={handleShowRootBinyanTenseTransDrilView}><Trans>Root/Binyan/Tense Translation</Trans></NavDropdown.Item>
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
                            <NavDropdown.Item onClick={handleAbout}><Trans>About the Application</Trans></NavDropdown.Item>
                            {/* <NavDropdown.Item onClick={handleHowTo}><Trans>How To?</Trans></NavDropdown.Item> */}
                            <NavDropdown.Item onClick={handleHowToSignup}><Trans>How To Register(Free)?</Trans></NavDropdown.Item>
                            <NavDropdown.Item onClick={handleContactMe}><Trans>Contact Me</Trans></NavDropdown.Item>
                            <NavDropdown.Item onClick={handleAbout}>{currentVersion}</NavDropdown.Item>
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
                    <Modal.Title>{<Trans>Register</Trans>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleRegisterSubmit}>
                        <Form.Group>
                            <Form.Label><Trans>Username</Trans></Form.Label>
                            <Form.Control type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label><Trans>Email</Trans></Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label><Trans>Password</Trans></Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label><Trans>Verify Password</Trans></Form.Label>
                            <Form.Control type="password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label><Trans>My Language</Trans></Form.Label>
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
                    <Modal.Title><Trans>Settings</Trans></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSettingsSubmit}>
                        <Form.Group>
                            <Form.Label><Trans>I Learn Language</Trans></Form.Label>
                            <Form.Control
                                as="select"
                                value={newLearningLanguage}
                                onChange={(e) => setNewLearningLanguage(e.target.value)}
                                required>
                                <option value="">Select a language</option>
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}
                                        selected={lang.code === newLearningLanguage}>
                                        {lang.name} / {lang.nativeName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>                        {!user && (
                            < Form.Group >
                                <Form.Label><Trans>My Language</Trans></Form.Label>
                                <Form.Control
                                    as="select"
                                    value={newUILanguage}
                                    onChange={(e) => setNewUILanguageWrapper(e.target.value)}
                                    required>
                                    <option value="">Select a language</option>
                                    {languages.map((lang) => (
                                        <option key={lang.code} value={extractCultureWrapper(lang.code)}
                                            selected={isSelectedCulture(lang.code, newUILanguage)}>
                                            {lang.name} / {lang.nativeName}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>)
                        }
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal >
            <Modal show={isCustomVideoModalOpen} onHide={handleOpenVideoLinkClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Open Video</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                className="form-control mb-2"
                                placeholder="Enter video title"
                                value={customVideoTitle}
                                onChange={(e) => Custom(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                className="form-control"
                                placeholder="Enter video URL"
                                value={customVideoUrl}
                                onChange={(e) => setCustomVideoUrl(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleOpenVideoLinkClose}>Close</Button>
                    <Button variant="primary" onClick={handleOpenVideo}>Open</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showFlashcardsModal}
                onHide={() => setShowFlashcardsModal(false)}
                dialogClassName="modal-dialog-scrollable"
            >
                <Modal.Header
                    style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1000 }}
                    className='bg-light'
                >
                    <div className="w-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Modal.Title><Trans>Flashcards Collection</Trans></Modal.Title>
                            <Form.Check
                                type="switch"
                                id="show-details-switch"
                                label={<Trans>Show Details</Trans>}
                                checked={showDetails}
                                onChange={(e) => setShowDetails(e.target.checked)}
                            />
                        </div>
                        <Form.Control
                            type="text"
                            placeholder={t`Filter flashcards`}
                            value={filterText}
                            onChange={handleFilterChange}
                        />
                    </div>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {filteredFlashcards?.length === 0 && <p>No flashcards found</p>}
                    {filteredFlashcards?.length > 0 && filteredFlashcards.map((flashcard, index) => (
                        <div key={index}>
                            <FlashcardEditor
                                card={flashcard}
                                onSave={handleSaveFlashcard}
                                onDelete={handleDeleteFlashcard}
                                showDetails={showDetails}
                            />
                            <hr />
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer
                    style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 1000 }}
                    className='bg-light'
                >
                    <div className="d-flex justify-content-between w-100">
                        <Button
                            onClick={handleExportToCSV}
                            className="btn btn-secondary"
                        >
                            {<Trans>Export</Trans>}
                        </Button>
                        <Button className="btn btn-danger" onClick={handleFlashcardsCollectionViewClose}>
                            {<Trans>Close</Trans>}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal show={showFlashcardExamViewModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{<Trans>Flashcards Exam</Trans>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FlashcardExam
                        cards={examCards}
                        onIKnowIt={handleIKnowIt}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleFlashcardExamViewClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showRootBinyanTenseViewModal}
                onHide={handleShowRootBinyanTenseTableDrillClose}
                fullscreen={true}>
                <Modal.Header closeButton>
                    <Modal.Title>{<Trans>Root/Binyan/Tense</Trans>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RootBinyanTenseTableDrill
                        user={user}
                        uiLanguage={uiLanguage}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleShowRootBinyanTenseTableDrillClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showRootBinyanTenseTransViewModal}
                onHide={handleShowRootBinyanTenseTransDrillClose}
                fullscreen={true}>
                <Modal.Header closeButton>
                    <Modal.Title>{<Trans>Root/Binyan/Tense Translation</Trans>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RootBinyanTenseTransDrill
                        user={user}
                        uiLanguage={uiLanguage}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleShowRootBinyanTenseTransDrillClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showAddCardModal} onHide={closeAddFlascardView} onShow={showAddCardModalForm}>
                <Modal.Header closeButton>
                    <Modal.Title><Trans>Add New Card</Trans></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCardFront">
                            <Form.Label><Trans>Front</Trans></Form.Label>
                            <Form.Control
                                type="text"
                                value={newCardFront}
                                onChange={(e) => setNewCardFront(e.target.value)}
                            />
                            <Form.Label><Trans>Back Side</Trans></Form.Label>
                            <Form.Control
                                type="text"
                                value={newCardBack}
                                onChange={(e) => setNewCardBack(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="secondary" onClick={() => translateFlashcard(newCardFront, newCardBack)}>
                            <Trans>Translate</Trans>
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeAddFlascardView}>
                        <Trans>Cancel</Trans>
                    </Button>
                    <Button variant="primary" onClick={handleAddCardConfirm}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TopDropdownMenu;


