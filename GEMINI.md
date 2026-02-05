# GEMINI.md

## Project Overview

This project is a frontend application for **NaoService by MPJ**, a SaaS solution for managing hair salons. The application is built with **React** and **TypeScript**, using **Vite** as a build tool. The UI is built with **shadcn-ui** and **Tailwind CSS**, and it uses a variety of libraries from the React ecosystem, including **React Router** for routing, **TanStack Query** for data fetching, and **React Hook Form** for forms.

The application has two main parts:

*   **A public-facing website** that allows customers to view services, book appointments, and contact the salon.
*   **An admin dashboard** that allows salon owners to manage their business, including clients, services, employees, appointments, and payments.

The codebase is well-structured, with a clear separation of concerns. It makes extensive use of **React Context** to manage global state, including authentication, tenant information, and theme.

## Building and Running

To get started with the project, you'll need to have **Node.js** and **npm** installed.

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start the Vite development server at `http://localhost:8080`.

3.  **Build the application:**

    ```bash
    npm run build
    ```

    This will create a production-ready build in the `dist` directory.

4.  **Run tests:**

    ```bash
    npm run test
    ```

## Development Conventions

*   **Styling:** The project uses **Tailwind CSS** for styling. Utility classes are preferred over custom CSS.
*   **Components:** The UI is built with **shadcn-ui**, which provides a set of accessible and customizable components.
*   **State Management:** Global state is managed with **React Context**. For data fetching, the project uses **TanStack Query**.
*   **Routing:** Routing is handled by **React Router**. The routes are defined in the `src/App.tsx` file.
*   **Linting:** The project uses **ESLint** to enforce code quality. You can run the linter with `npm run lint`.
*   **File Structure:** The `src` directory is organized by feature, with separate directories for components, pages, contexts, hooks, and lib.
*   **Aliasing:** The project uses a path alias `@` to refer to the `src` directory.
