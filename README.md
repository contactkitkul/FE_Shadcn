# Authentication App with Next.js and shadcn/ui

A modern authentication application built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- ✨ Modern and beautiful UI with shadcn/ui components
- 🔐 Complete authentication flow
  - Login page
  - Sign up page
  - Forgot password page
- 📊 Dashboard with stats and activity feed
- 🎨 Responsive design with Tailwind CSS
- 🌙 Dark mode support
- ⚡ Built with Next.js 14 App Router
- 📱 Mobile-friendly

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Sign up page
│   ├── forgot-password/ # Password reset page
│   ├── dashboard/      # Dashboard page
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   └── ui/             # shadcn/ui components
└── lib/
    └── utils.ts        # Utility functions
```

## Available Routes

- `/` - Home page with links to login and signup
- `/login` - Login page
- `/signup` - Sign up page
- `/forgot-password` - Password reset page
- `/dashboard` - Dashboard (accessible after login)

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Lucide React** - Icon library

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Notes

- This is a demo application with simulated authentication
- In production, you should implement proper authentication with a backend API
- Consider adding state management (e.g., Zustand, Redux) for larger applications
- Add form validation library (e.g., react-hook-form, zod) for better form handling

## License

MIT
