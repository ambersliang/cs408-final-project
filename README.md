# Final Project

## Project Spec

The flashcard application is designed to allow users to create and review flashcards to study. The main landing page welcomes users and allows them to input their names. If the name already exists, a popup will prompt users to enter an ID; if the name does not exist, a popup will allow users to create an ID. The create and review pages are authenticated for usage, ensuring that users can only access their personalized flashcards.

The create page features an intuitive add form where users can create custom flashcards with terms on one side and answers on the other. Below the form is a table displaying all the flashcards the user has created, allowing for easy management. The table includes a delete button beside each row to remove unwanted cards, similar to the simple inventory lab from last week. This makes it simple for users to delete and recreate any cards necessary. It might be extended to edit after the basic functionalities are completed.

The review page will shuffle the cards each time the user clicks on the review tab and show them in random order for review, ensuring it's good for review every time. A progress bar will track how many flashcards have been reviewed, based on the number of interactions with the cards, giving users a visual indication of their progress.

The target audience for this application is the general public, with a leaning toward students who use flashcards to help with studying. The application manages several types of data: user names and IDs for authentication, flashcard data including terms and definitions, and a record of the progress made during reviews. The data should have different tables to manage each of them.

Once the basic functionality is implemented, additional features will be considered, such as the ability to categorize flashcards by subject to avoid having all cards in a single collection. This will make it easier for users to organize their study materials by topic, such as history, math, and science. Another feature involves replacing user IDs with passwords, creating a more secure environment where users can log in and manage their cards with more protection. This security enhancement will help safeguard user information and flashcard data. A third feature will allow users to assign colors to their cards, increasing accessibility for users with visual impairments. This will help users who may have difficulty seeing certain colors or who might benefit from personalized color schemes to improve focus. Color customization options will be provided to allow users to select colors that work best for them, whether for better contrast or better focus.

For user accessibility, I will implement keyboard navigation so the app can be fully used without a mouse. The progress bar will show both a visual indicator and a numerical percentage. Tables will be labeled clearly for screen readers. The layout will be simple, clean, and user-friendly, ensuring ease of navigation for all users, including those with disabilities. The overall color scheme will most likely be light blue or light green for a fresh look. 

## Project Wireframe

![flashcard landing page image](flashcard-land.png)

![flashcard create page image](flashcard-create.png)

![flashcard review page image](flashcard-review.png)