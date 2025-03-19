# Documents Processing & Task Generation Platform

## Project Overview

The Documents Processing & Task Generation Platform is an advanced tool designed to streamline document handling, analysis, and task creation for organizations. Users can securely upload PDF documents, which are analyzed through OpenAI's ChatGPT API to generate actionable tasks customized to the document content. The platform provides a secure user authentication system, a robust dashboard, and comprehensive task management features, all within an intuitive interface.

This platform is ideal for organizations looking to improve document processing workflows, automatically generate tasks based on document insights, and manage tasks efficiently from a centralized hub.

## Features

- **Secure Document Upload**: Provides a drag-and-drop interface for PDF document uploads with a complete document history.
- **Automated Document Analysis**: Utilizes ChatGPT integration to analyze document content and generate actionable insights.
- **Task Generation & Management**: Creates tasks based on document insights, with tools to view, update, and track task progress.
- **User Authentication & Profile Management**: Features a secure registration and login system using JWT, along with user profile management.
- **Centralized Dashboard**: A comprehensive dashboard to manage documents, view generated tasks, and track activity.
- **Insight Analytics**: Displays data insights, such as F Tag compliance in nursing homes, based on user location.
- **Policy Generator**: Generates custom policies for organizations based on specific regulatory or operational requirements.
- **Demo Survey Feature**: Offers a demo survey button on the landing page, allowing users to preview the task generation workflow.

## Tech Stack

- **Frontend Framework**: React.js
- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB (NoSQL)
- **GPT Integration**: OpenAI's ChatGPT API for document processing and task generation
- **Deployment**: Vercel for the frontend, AWS or Heroku for the backend, and MongoDB Atlas for cloud database management

## Modules

1. **User Authentication Module**: Secure sign-up, login, and profile management functionalities utilizing JWT for authentication.
2. **Document Management Module**: Allows document uploads, parsing, and storage with progress tracking and error handling.
3. **ChatGPT Integration Module**: Processes document content with ChatGPT to generate a plan of action based on document analysis.
4. **Task Management Module**: Automates task creation from GPT-generated insights, supporting CRUD operations and task filtering.
5. **Dashboard Module**: A central dashboard for managing documents, viewing task lists, and tracking updates and notifications.
6. **Insights & Policy Generation Module**: Provides analytics and generates policies tailored to organizational requirements.

## Key Contributors

- **Sohaib Sarwar**: Full Stack Developer responsible for implementing both frontend and backend functionalities, including API integrations and task generation.
- **Ibrahim Saleh**: Sr. Lead Developer overseeing system architecture, ensuring code quality, and managing team coordination for the project.

## Installation & Setup

1. **Backend Setup**:
   - Clone the repository and navigate to the backend directory.
   - Install dependencies using `npm install`.
   - Configure environment variables for MongoDB and OpenAI API keys.
   - Start the backend server with `npm start`.

2. **Frontend Setup**:
   - Navigate to the frontend directory.
   - Install dependencies using `npm install`.
   - Configure the frontend environment file for API configurations.
   - Deploy the frontend locally with `npm start`.

## Deployment

The platform is designed for cloud deployment to ensure scalability and reliability. Recommended deployment platforms:
- **Frontend**: Vercel or Netlify
- **Backend**: AWS or Heroku
- **Database**: MongoDB Atlas for a managed cloud database solution

## Contact

For questions or additional support, connect with the Paklogics team for detailed guidance and project assistance.
