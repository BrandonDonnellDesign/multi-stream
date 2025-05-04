# Live Stream Aggregator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/your-username/live-stream-aggregator/issues)

A live stream aggregator that lets you watch multiple streams from different platforms all in one place!

![Live Stream Aggregator Screenshot](https://via.placeholder.com/800x400?text=Live+Stream+Aggregator+Screenshot+Here)

## ✨ Features

-   **Multi-Platform Support:** Watch live streams from Kick, Twitch, and YouTube, all within a single interface.
-   **Customizable Stream Layout:** Arrange and resize streams to create your ideal viewing experience.
-   **Live Status:** Know which streams are currently live with real-time updates.
-   **Integrated Chat:** Interact with other viewers directly within each stream's chat.
- **Easy Stream Management:** Add and remove streams from your list quickly and easily.
-   **Responsive Design:** Enjoy a seamless viewing experience on any device, from desktop to mobile.

## 🛠️ Tech Stack

-   **Frontend:**
    -   React: For building the user interface.
    -   Next.js: For server-side rendering and routing.
    -   TypeScript: For type safety and improved code maintainability.
    -   Tailwind CSS: For rapid UI development and styling.
    - Radix UI: For accessable and composable components.
    - Sonner: For creating slick Toast notifications.
-   **Backend:**
    -   (Optional) Node.js: For creating any custom backend functionality.
-   **APIs:**
    -   Kick API: For fetching Kick stream data.
    -   Twitch API: For fetching Twitch stream data.
    -   YouTube API: For fetching YouTube stream data.

## 🚀 Setup

1.  **Clone the Repository:**
```
bash
    git clone https://github.com/BrandonDonnellDesign/multi-stream
    
```
2.  **Navigate to the Project Directory:**
```
bash
    cd multi-stream
    
```
3.  **Install Dependencies:**
```
bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    
```
4.  **Environment Variables:**

    - Create a `.env.local` file in the root of the project.
    - Add API keys for the Kick, Twitch, and YouTube APIs to the `.env.local`. example:
```
    NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
    NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
    
```
5.  **Start the Development Server:**
```
bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    
```
6.  **Open Your Browser:**

    -   Visit `http://localhost:3000` to view the application.

## 🙌 Contributions

Contributions are always welcome! If you'd like to contribute to this project, please follow these steps:

1.  **Fork the Repository:** Create your own fork of this project.
2.  **Create a Branch:** Create a new branch for your feature or bug fix.
3.  **Make Changes:** Implement your changes or bug fixes.
4.  **Test Thoroughly:** Ensure that your changes do not break any existing functionality.
5.  **Submit a Pull Request:** Submit a pull request to the `main` branch of the original repository.

Please make sure your code adheres to the project's coding style and that you have tested your changes thoroughly.

## ⚖️ License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).