const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
let dom, document, xhrMock, localStorageMock;


/**
 * Test suite for the Index functionality
 */
const mainHtml = fs.readFileSync(path.resolve(__dirname, '../html/index.html'), 'utf8');

describe('Index functionality', () => {
    // Sets up environment for test
    beforeEach(() => {

        // Create a new JSDOM instance with the HTML content calling from index.html file
        dom = new JSDOM(mainHtml, { runScripts: "dangerously", resources: "usable" });
        document = dom.window.document;

        // Mock the XMLHttpRequest to intercept AJAX requests
        xhrMock = {
            open: jest.fn(),
            setRequestHeader: jest.fn(),
            send: jest.fn(),
            onload: jest.fn()
        };

        dom.window.XMLHttpRequest = jest.fn(() => xhrMock);
    });

    // Test to ensure that the form submission is prevented
    it('should prevent default form submission', () => {
        const form = document.getElementById('user-signin');
        const event = new dom.window.Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });

    // Test to check if a PUT request is sent with the correct user name
    it('should send a PUT request with the user name', (done) => {
        const form = document.getElementById('user-signin');
        const input = document.getElementById('name');
        input.value = 'testuser';

        const xhrMock = {
            open: jest.fn(),
            setRequestHeader: jest.fn(),
            send: jest.fn(),
            onload: jest.fn()
        };

        dom.window.XMLHttpRequest = jest.fn(() => xhrMock);

        form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

        expect(xhrMock.open).toHaveBeenCalledWith('PUT', 'https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users');
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify({ name: 'testuser' }));

        done();
    });

});

/**
 * Test suite for the Create Flashcard functionality
 */
const createHtml = fs.readFileSync(path.resolve(__dirname, '../html/create.html'), 'utf8');

describe('Create Flashcard functionality', () => {

    beforeEach(() => {
        // Setup a simple localStorage mock
        localStorageMock = (function () {
            let store = {};
            return {
                getItem: function (key) {
                    return store[key] || null;
                },
                setItem: function (key, value) {
                    store[key] = value.toString();
                },
                removeItem: function (key) {
                    delete store[key];
                },
                clear: function () {
                    store = {};
                }
            };
        })();

        // Initialize JSDOM with localStorage mock
        dom = new JSDOM(createHtml, {
            url: "http://localhost",
            runScripts: "dangerously",
            resources: "usable",
            beforeLoad(win) {
                win.localStorage = localStorageMock;
            }
        });
        document = dom.window.document;

        // Mock the XMLHttpRequest to intercept AJAX requests
        xhrMock = {
            open: jest.fn(),
            send: jest.fn(),
            setRequestHeader: jest.fn(),
            onload: jest.fn(),
            addEventListener: jest.fn((event, callback) => {
                if (event === 'load') {
                    callback();
                }
            }),
            response: JSON.stringify({
                flashcards: [
                    { term: 'term1', definition: 'definition1', uniqueID: '1' },
                    { term: 'term2', definition: 'definition2', uniqueID: '2' }
                ]
            })
        };

        dom.window.XMLHttpRequest = jest.fn(() => xhrMock);
        dom.window.localStorage.setItem('userID', '123');
    });

    // Test to ensure userId is stored in localStorage
    it('should store userId in localStorage', () => {
        dom.window.localStorage.setItem('userId', 'user123');
        expect(dom.window.localStorage.getItem('userId')).toBe('user123');
    });


    // Test to ensure a PUT request is made
    it('should send a PUT request with the flashcard data', (done) => {

        const form = document.getElementById('add-form');
        const input = document.getElementById('term');
        const definitionInput = document.getElementById('definition');
        input.value = 'test term';
        definitionInput.value = 'test definition';

        // Simulate form submission
        form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

        setTimeout(() => {
            // Confirm that the userId fetched from localStorage is being sent
            expect(xhrMock.open).toHaveBeenCalledWith('PUT', 'https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users/flashcards');
            expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify({
                userID: localStorageMock.getItem('userId'),
                term: 'test term',
                definition: 'test definition'
            }));
            done();
        }, 0);
    });


    // Test to ensure that flashcards are loaded
    it('should load flashcards into the table', (done) => {
        dom.window.onload();

        expect(xhrMock.open).toHaveBeenCalledWith('GET', `https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users/flashcards?userID=${localStorageMock.getItem('userId')}`);
        expect(xhrMock.send).toHaveBeenCalled();

        setTimeout(() => {
            const tableBody = document.getElementById('table-body');
            expect(tableBody.innerHTML).toContain('term1');
            expect(tableBody.innerHTML).toContain('definition1');
            expect(tableBody.innerHTML).toContain('term2');
            expect(tableBody.innerHTML).toContain('definition2');
            done();
        }, 0);
    });

    // Test to ensure that a flashcard is deleted when the delete button is clicked
    it('should delete a flashcard when delete button is clicked', (done) => {
        dom.window.onload();

        setTimeout(() => {
            const deleteButton = document.querySelector('.delete-button');
            deleteButton.click();

            expect(xhrMock.open).toHaveBeenCalledWith('DELETE', `https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users/flashcards/1?userID=${localStorageMock.getItem('userId')}`);
            expect(xhrMock.send).toHaveBeenCalled();

            done();
        }, 0);
    });
});

/**
 * Test suite for the Review Flashcard functionality
 */
const reviewHtml = fs.readFileSync(path.resolve(__dirname, '../html/review.html'), 'utf8');

describe('Review Flashcard functionality', () => {

    // Sets up environment for test
    beforeEach(() => {
        localStorageMock = (function () {
            let store = {};
            return {
                getItem: function (key) {
                    return store[key] || null;
                },
                setItem: function (key, value) {
                    store[key] = value.toString();
                },
                removeItem: function (key) {
                    delete store[key];
                },
                clear: function () {
                    store = {};
                }
            };
        })();

        // Initialize JSDOM with localStorage mock
        dom = new JSDOM(reviewHtml, {
            url: "http://localhost",
            runScripts: "dangerously",
            resources: "usable",
            beforeLoad(win) {
                win.localStorage = localStorageMock;
            }
        });
        document = dom.window.document;

        // Mock the XMLHttpRequest to intercept AJAX requests
        xhrMock = {
            open: jest.fn(),
            send: jest.fn(),
            setRequestHeader: jest.fn(),
            onload: jest.fn(),
            addEventListener: jest.fn((event, callback) => {
                if (event === 'load') {
                    callback();
                }
            }),
            response: JSON.stringify({
                flashcards: [
                    { term: 'term1', definition: 'definition1', uniqueID: '1' },
                    { term: 'term2', definition: 'definition2', uniqueID: '2' }
                ]
            })
        };

        dom.window.XMLHttpRequest = jest.fn(() => xhrMock);
        dom.window.localStorage.setItem('userId', '123');
    });

    // Test to verify that flashcards are loaded into the flashcard container
    it('should load flashcards into the flashcard container', (done) => {
        dom.window.onload();

        expect(xhrMock.open).toHaveBeenCalledWith('GET', `https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users/flashcards?userID=${localStorageMock.getItem('userId')}`);
        expect(xhrMock.send).toHaveBeenCalled();

        setTimeout(() => {
            const flashcardContainer = document.getElementById('flashcard-container');
            expect(flashcardContainer.innerHTML).toContain('term1');
            expect(flashcardContainer.innerHTML).toContain('definition1');
            expect(flashcardContainer.innerHTML).toContain('term2');
            expect(flashcardContainer.innerHTML).toContain('definition2');
            done();
        }, 0);
    });

    // Test to verify that a "No flashcards found" message is displayed when there are no flashcards
    it('should display "No flashcards found." when there are no flashcards', (done) => {
        xhrMock.response = JSON.stringify({ flashcards: [] });
        dom.window.onload();

        setTimeout(() => {
            const flashcardContainer = document.getElementById('flashcard-container');
            expect(flashcardContainer.innerHTML).toContain('No flashcards found.');
            done();
        }, 0);
    });

    // Test to verify that the "flipped" class is toggled when a flashcard is clicked
    it('should toggle the "flipped" class when a flashcard is clicked', (done) => {
        dom.window.onload();

        setTimeout(() => {
            const flashcard = document.querySelector('.flashcard');
            flashcard.click();
            expect(flashcard.classList.contains('flipped')).toBe(true);
            flashcard.click();
            expect(flashcard.classList.contains('flipped')).toBe(false);
            done();
        }, 0);
    });
});

/**
 * Test suite for the Study Flashcard functionality
 */
const studyHtml = fs.readFileSync(path.resolve(__dirname, '../html/study.html'), 'utf8');

describe('Study Flashcard functionality', () => {

    // Sets up environment for test
    beforeEach(() => {
        localStorageMock = (function () {
            let store = {};
            return {
                getItem: function (key) {
                    return store[key] || null;
                },
                setItem: function (key, value) {
                    store[key] = value.toString();
                },
                removeItem: function (key) {
                    delete store[key];
                },
                clear: function () {
                    store = {};
                }
            };
        })();

        // Initialize JSDOM with localStorage mock and HTML content
        dom = new JSDOM(studyHtml, {
            url: "http://localhost",
            runScripts: "dangerously",
            resources: "usable",
            beforeLoad(win) {
                win.localStorage = localStorageMock;
                win.localStorage.setItem("userID", "123");
            }
        });
        document = dom.window.document;

        // Mock the XMLHttpRequest to intercept AJAX requests
        xhrMock = {
            open: jest.fn(),
            send: jest.fn(),
            setRequestHeader: jest.fn(),
            onload: jest.fn(),
            addEventListener: jest.fn((event, callback) => {
                if (event === 'load') {
                    callback();
                }
            }),
            response: JSON.stringify({
                flashcards: [
                    { term: 'term1', definition: 'definition1', uniqueID: '1' },
                    { term: 'term2', definition: 'definition2', uniqueID: '2' }
                ]
            })
        };


        dom.window.XMLHttpRequest = jest.fn(() => xhrMock);
        dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
        dom.window.localStorage.setItem('userID', '123');
    });

    // Test to verify that flashcards are loaded into the terms and definitions containers
    it('should load flashcards into the terms and definitions containers', (done) => {
        dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

        userID = localStorageMock.getItem('userId');

        expect(xhrMock.open).toHaveBeenCalledWith('GET', `https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users/flashcards?userID=${localStorageMock.getItem('userId')}`);
        expect(xhrMock.send).toHaveBeenCalled();

        setTimeout(() => {
            const termsContainer = document.getElementById('terms');
            const definitionsContainer = document.getElementById('definitions');
            expect(termsContainer.innerHTML).toContain('term1');
            expect(definitionsContainer.innerHTML).toContain('definition1');
            expect(termsContainer.innerHTML).toContain('term2');
            expect(definitionsContainer.innerHTML).toContain('definition2');
            done();
        }, 0);
    });

    // Test to verify "Correct match!" message when a correct match is made
    it('should display "Correct match!" when a correct match is made', (done) => {
        dom.window.dispatchEvent(new dom.window.Event('load'));

        setTimeout(() => {
            // Retrieve all term and definition buttons
            const termButtons = document.querySelectorAll('.term');
            const definitionButtons = document.querySelectorAll('.definition');

            let matchingId = '1'; // ID of the term and definition to match

            // Find term and definition buttons with the same data-id
            const termButton = Array.from(termButtons).find(button => button.dataset.id === matchingId);
            const definitionButton = Array.from(definitionButtons).find(button => button.dataset.id === matchingId);

            // Simulate clicking the matched term and definition
            if (termButton && definitionButton) {
                termButton.click();
                definitionButton.click();

                const feedback = document.getElementById('feedback');
                expect(feedback.textContent).toContain('Correct match!');
            } else {
                throw new Error('Matching buttons not found');
            }

            done();
        }, 0);
    });

    // Test to verify "Incorrect match. Try again!" message when an incorrect match is made
    it('should display "Incorrect match. Try again!" when an incorrect match is made', (done) => {
        dom.window.dispatchEvent(new dom.window.Event('load'));

        setTimeout(() => {
            // Retrieve all term and definition buttons
            const termButtons = document.querySelectorAll('.term');
            const definitionButtons = document.querySelectorAll('.definition');

            // Find any term and a non-matching definition
            const termButton = termButtons[0];
            let definitionButton;

            // Ensure the selected definition does not match the term's ID
            for (let i = 0; i < definitionButtons.length; i++) {
                if (definitionButtons[i].dataset.id !== termButton.dataset.id) {
                    definitionButton = definitionButtons[i];
                    break;
                }
            }

            // Simulate clicking the non-matched term and definition
            if (termButton && definitionButton) {
                termButton.click();
                definitionButton.click();

                const feedback = document.getElementById('feedback');
                expect(feedback.textContent).toContain('Incorrect match. Try again!');
            } else {
                throw new Error('Non-matching buttons not found');
            }

            done();
        }, 0);
    });

    // Test to verify "Good Job!" message and displayRestartButton when all matches are made
    it('should display "Good Job!" when all matches are made', (done) => {
        dom.window.dispatchEvent(new dom.window.Event('load'));

        setTimeout(() => {
            // Retrieve all term and definition buttons
            const termButtons = document.querySelectorAll('.term');
            const definitionButtons = document.querySelectorAll('.definition');

            // Make matches based on data-id
            termButtons.forEach((termButton) => {
                const matchingDefinition = Array.from(definitionButtons).find(definitionButton =>
                    definitionButton.dataset.id === termButton.dataset.id
                );

                if (matchingDefinition) {
                    termButton.click();
                    matchingDefinition.click();
                }
            });

            // Check for the "Good Job!" feedback message
            const feedback = document.getElementById('feedback');
            expect(feedback.textContent).toContain('Good Job!');

            // Check if the restart button is displayed
            const restartButton = document.getElementById('restartButton');
            expect(restartButton).not.toBeNull();
            expect(restartButton.textContent).toBe('Click to study more');

            done();
        }, 0);
    });
});