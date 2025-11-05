# 🚀 YouthForge Quick Start Guide

## Getting Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Step 1: Navigate to Project
```bash
cd /Users/anshyadav/Documents/MAJOR_PROJECTS/youth
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Start Development Server
```bash
npm run dev
# or
yarn dev
```

### Step 4: Open in Browser
```
http://localhost:3000
```

✅ You should now see the YouthForge home page!

---

## 📖 Page Navigation

### Available Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, projects, developers, challenges |
| `/projects` | Projects | Browse all projects with filters |
| `/developers` | Developers | Find developers by skills |
| `/challenges` | Challenges | View and join challenges |
| `/about` | About | Learn about YouthForge |
| `/contact` | Contact | Get in touch / FAQ |
| `/profile` | Profile | View user profile |

---

## 🎮 Features to Explore

### Home Page
- Click the navigation links to explore different sections
- Use theme toggle (moon/sun icon) to switch dark/light mode
- Scroll to see smooth animations

### Projects Page
- **Search**: Type in the search box to find projects
- **Filter**: Click category buttons to filter projects
- **Paginate**: Use pagination buttons at the bottom

### Developers Page
- **Search**: Find developers by name
- **Filter Skills**: Check skill boxes in the sidebar
- **View Profiles**: Click developer cards to see details

### Challenges Page
- **Search**: Find challenges by title
- **Filter by Category**: Select from category buttons
- **Filter by Difficulty**: Choose Easy/Intermediate/Hard
- **Join**: Click "Join Challenge" button

### Contact Page
- **Fill Form**: Try the contact form
- **Submit**: Form shows success notification
- **View FAQ**: Scroll to see answers

---

## 🎨 Dark Mode

Click the **moon/sun icon** in the top right corner to toggle between:
- 🌙 Dark Mode (default)
- ☀️ Light Mode

The theme will instantly switch across all pages.

---

## 📱 Responsive Testing

Test the responsive design:

### Desktop (1280px+)
- Full 3-column grids
- Sidebar filters visible
- All navigation visible

### Tablet (768px - 1024px)
- 2-column grids
- Filters move to main area
- Hamburger menu may appear

### Mobile (< 640px)
- Single column layout
- Hamburger menu in navbar
- Filters collapse
- Touch-friendly spacing

**Browser Tips**:
- Open DevTools: `F12` or `Cmd+Option+I`
- Toggle device toolbar: `Ctrl+Shift+M`

---

## 🔧 Common Tasks

### Make Changes to Code
1. Edit any `.tsx` file in `app/` or `components/`
2. Save the file
3. Browser auto-refreshes with your changes

### Add New Mock Data
1. Edit `lib/mockData.ts`
2. Update the arrays with new items
3. They'll appear on the pages automatically

### Change Colors
1. Edit `tailwind.config.ts`
2. Update the color values in the theme
3. Changes apply automatically

### Modify Navigation Links
1. Edit `components/layout/Navbar.tsx`
2. Update the `navLinks` array
3. Menu updates instantly

---

## 🐛 Troubleshooting

### Page Won't Load
- Check console for errors: `F12 → Console`
- Ensure dev server is running
- Try refreshing the page

### Animations Laggy
- Check browser performance
- Disable extensions
- Try a different browser

### Images Not Loading
- Unsplash URLs might be rate-limited
- Replace with local images in `lib/mockData.ts`

### Theme Not Switching
- Check browser console for errors
- Clear localStorage if needed
- Reload the page

---

## 📚 Project Structure Quick Reference

```
Key folders to explore:

app/(main)/              ← All page components
├── page.tsx            ← Home page
├── projects/           ← Projects page
├── developers/         ← Developers page
├── challenges/         ← Challenges page
├── about/              ← About page
├── contact/            ← Contact page
└── profile/            ← Profile page

components/             ← Reusable components
├── layout/            ← Navbar, Footer
└── cards/             ← ProjectCard, DeveloperCard, etc.

lib/
├── store.ts           ← Theme & User state
└── mockData.ts        ← All mock data

tailwind.config.ts     ← Design tokens
globals.css            ← Global styles & utilities
```

---

## 🎓 Learning Opportunities

### Explore These Files:
1. **Navbar.tsx** - Scroll detection, theme toggle
2. **ProjectCard.tsx** - Card component with Framer Motion
3. **page.tsx** (Home) - Complex layouts with animations
4. **projects/page.tsx** - Search, filter, pagination logic
5. **globals.css** - Glass effect utilities

### Try These Edits:
1. Change colors in `tailwind.config.ts`
2. Add new projects to `lib/mockData.ts`
3. Modify navigation links in `components/layout/Navbar.tsx`
4. Add new categories in `lib/mockData.ts`

---

## 🚀 Build for Production

When ready to deploy:

```bash
npm run build
npm start
# Production build ready to deploy
```

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Tab` - Navigate between interactive elements
- `Enter` - Activate buttons
- `Esc` - Close modals (when implemented)

### Browser DevTools
- **Elements** - Inspect components
- **Console** - Check for errors
- **Network** - Monitor API calls (Phase 2)
- **Performance** - Check animations

### Code Tips
- Components use TypeScript for type safety
- Framer Motion for animations
- Zustand for global state
- Tailwind CSS for styling

---

## 📞 Need Help?

Check these resources:
- 📖 `README.md` - Project overview
- 📚 `PHASE1_DOCUMENTATION.md` - Technical details
- ✅ `COMPLETION_SUMMARY.md` - What's implemented

---

## 🎉 Next Steps

### Learn the Codebase
1. Read `PHASE1_DOCUMENTATION.md`
2. Explore component files
3. Try making small changes

### Customize It
1. Change colors and fonts
2. Add/remove features
3. Modify animations

### Prepare for Phase 2
1. Plan database schema
2. Design API routes
3. Plan authentication flow

---

## Version Info
- **Node.js**: 16+ required
- **npm**: 8+ required
- **Next.js**: 13.5.1
- **React**: 18.2.0
- **TypeScript**: 5.2.2

---

**Happy Coding! 🚀**

For detailed information, see the full documentation files in the project root.
