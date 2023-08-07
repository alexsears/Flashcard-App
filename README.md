Flashcard App
This project is a flashcard application built with React, Firebase, and Bootstrap. It includes a Manager Console for users with manager roles, allowing them to access additional functionalities.

Overview
The application serves as an educational tool that allows users to review information using flashcards. It supports user authentication with Firebase, and user data is stored in Firestore.

The application has four main components:

Flashcard: This component displays the question and answer on a single flashcard and allows the user to respond by clicking on the card. The card can also be flipped to show the answer, and text-to-speech functionality is provided to read the content aloud.

FlashcardList: This component handles the logic for displaying a list of flashcards for the user to review. It fetches flashcards from the server, displays the current flashcard, and manages the user's response to each flashcard.

ManagerConsole: This component is designed for users with the 'manager' role. It displays a table of user data and user learning progress. The manager can click on a row to fetch the learning progress for a particular user.

App: This is the main component that sets up routing and manages user authentication. It fetches user data from Firestore upon successful authentication and fetches flashcards for the logged-in user.

The server-side code includes various API endpoints to manage the flashcards and user learning progress. These include assignFlashcards, getFlashcards, and getFlashcard.

Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
You need to have Node.js and npm installed on your machine. This project was built using Node.js version 14.17.0 and npm version 6.14.13.

Installation

Clone the repository:
git clone https://github.com/<your-github-username>/flashcard-app.git

Change your directory to the cloned repository:
cd flashcard-app

Install all the necessary packages:
npm install

Start the application:
npm start
The application should now be running on http://localhost:3000.

Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

License
This project is licensed under the MIT License - see the LICENSE.md file for details.
