# Diverto Design Style Guide - Brutalism

## Overview
Diverto uses a **Digital Brutalism** design style characterized by bold, high-contrast aesthetics, thick borders, and statement-making typography.

---

## Color Palette

### Primary Colors
- **Background**: `bg-yellow-300` (Yellow - #FCCF3D)
- **Text**: `text-black` (Black - #000000)
- **Accent**: `bg-yellow-400` / `bg-yellow-500` (Yellow shades for interactions)

### Secondary Colors
- **White**: `bg-white` (For cards and content areas)
- **Gray**: `text-gray-600`, `text-gray-500`, `text-gray-800` (For secondary text)
- **Red**: `text-red-600` (For logout/danger actions)

### Usage Rules
- High contrast: Yellow background + Black text
- White cards on yellow background for content areas
- Yellow accent buttons for primary CTAs
- Black text for all headlines and labels

---

## Typography

### Font
- **Family**: Fredoka (Google Font - friendly, modern, bold)
- **Import**: Already configured in `src/index.css`

### Heading Styles
```
- Large Headlines: text-5xl sm:text-6xl font-black
- Section Headers: text-2xl font-bold
- Button Text: text-sm font-semibold / font-bold
- Small Labels: text-xs text-gray-500
```

### Font Weights
- Headlines: `font-black` (900)
- Section titles: `font-bold` (700)
- Regular text: `font-medium` (500)
- Labels: `font-semibold` (600)

---

## Borders & Outlines

### Border Style Rules
- **Cards/Containers**: `border-4 border-black` (Thick, bold borders)
- **Buttons**: `border-2 border-black` or `border-4 border-black` (depending on prominence)
- **Input fields**: `border-2 border-black` (visible, clear boundaries)
- **No rounded corners**: Keep borders crisp and angular
- **Rounded radius**: Use `rounded-xl` or `rounded-2xl` for slight softness (not too rounded)

### Outline Examples
```jsx
{/* Card with thick border */}
<div className="border-4 border-black bg-white rounded-2xl p-8">

{/* Button with border */}
<button className="border-4 border-black rounded-xl bg-yellow-400 hover:bg-yellow-500">

{/* Input with border */}
<input className="border-2 border-black rounded-lg" />
```

---

## Component Styling Patterns

### Buttons
```jsx
{/* Primary Button (Yellow) */}
<button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg px-6 py-2 border-2 border-black transition-all duration-200">
  Label
</button>

{/* Secondary Button (White with border) */}
<button className="bg-white border-4 border-black text-black font-bold rounded-lg px-6 py-2 hover:bg-gray-50 transition-all">
  Label
</button>

{/* Icon Buttons */}
<button className="h-10 w-10 rounded-lg bg-yellow-400 hover:bg-yellow-500 border-2 border-black flex items-center justify-center">
  <IconComponent className="h-5 w-5 text-black" />
</button>
```

### Cards
```jsx
{/* Content Card */}
<div className="bg-white rounded-2xl border-4 border-black shadow-lg hover:shadow-xl transition-all p-8">
  <h2 className="text-2xl font-bold text-black">Title</h2>
  <p className="text-gray-600">Content</p>
</div>
```

### Form Elements
```jsx
{/* Input Fields */}
<input 
  className="w-full px-4 py-2 border-2 border-black rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black"
  placeholder="Enter text"
/>

{/* Label */}
<label className="text-sm font-semibold text-black uppercase tracking-wider">
  Field Label
</label>
```

### Dropdowns
```jsx
{/* Dropdown Container */}
<div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border-2 border-black z-50">
  {/* Menu Items */}
  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-yellow-50 transition-colors text-black">
    Option
  </button>
</div>
```

---

## Spacing & Layout

### Padding
- **Container padding**: `px-4 py-6` to `px-8 py-12`
- **Card padding**: `p-6` to `p-8`
- **Button padding**: `px-4 py-2` to `px-6 py-3`
- **Input padding**: `px-4 py-2` to `px-4 py-3`

### Margins & Gaps
- **Section gaps**: `gap-6` to `gap-8`
- **Component spacing**: `mb-4` to `mb-8`
- **Grid gaps**: `gap-6` (between cards/columns)

### Alignment
- **Center content**: Use flexbox `flex items-center justify-center`
- **Text alignment**: `text-center` for headings, `text-left` for body text
- **Vertical stacking**: Default block layout or `flex flex-col`

---

## Interactive Elements & Hover States

### Hover Effects
```jsx
{/* Button hover */}
className="hover:bg-yellow-500 transition-all duration-200"

{/* Card hover */}
className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300"

{/* Icon hover */}
className="group-hover:scale-110 transition-transform"

{/* Text hover */}
className="hover:text-black transition-colors"
```

### Transition Speeds
- Quick interactions: `duration-200`
- Medium transitions: `duration-300`
- Smooth animations: `duration-500`

---

## Icons & Visual Elements

### Icon Styling
```jsx
{/* Icon in button */}
<User className="h-5 w-5 text-black group-hover:scale-110 transition-transform" />

{/* Icon in card header */}
<Send className="h-8 w-8 text-black" />

{/* Icon button background */}
<div className="bg-yellow-400 rounded-xl border-2 border-black p-3">
  <Icon className="h-6 w-6 text-black" />
</div>
```

### Icon sizing
- Small: `h-4 w-4`
- Medium: `h-5 w-5`
- Large: `h-8 w-8` or `h-10 w-10`
- Extra large: `h-16 w-16` or `h-20 w-20`

---

## Background Patterns

### Background Decorations
```jsx
{/* Animated gradient circles */}
<div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-100 rounded-full blur-3xl opacity-30" />
<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-50 rounded-full blur-3xl opacity-20" />
```

### Gradient Usage
- **Subtle gradients**: `bg-gradient-to-b from-yellow-300 to-yellow-200`
- **Transparency**: Use opacity variations like `opacity-30` for background elements

---

## Shadows & Depth

### Shadow Styles
```jsx
{/* Light shadow */}
className="shadow-md"

{/* Standard shadow */}
className="shadow-lg"

{/* Enhanced on hover */}
className="shadow-lg hover:shadow-xl transition-shadow"
```

### No 3D Effects
- Avoid: 3D transforms, deep shadows, gradients that look 3D
- Keep: Flat design with clear layer separation via borders and colors

---

## Responsive Design

### Breakpoints
- Mobile first: Default styles for mobile
- Small: `sm:` - 640px
- Medium: `md:` - 768px
- Large: `lg:` - 1024px

### Responsive Text
```jsx
<h1 className="text-4xl sm:text-5xl md:text-6xl font-black">
  Responsive Heading
</h1>
```

### Grid Layout
```jsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Cards */}
</div>
```

---

## DO's and DON'Ts

### ✅ DO
- Use **thick black borders** (border-2 to border-4)
- Make elements **bold and confident**
- Use **high contrast** colors
- Keep **clear visual hierarchy**
- Use **geometric shapes** and straight edges
- Apply **strong typography** with heavy fonts
- Include **yellow accents** for interactive elements
- Maintain **consistent spacing** across components

### ❌ DON'T
- Use subtle colors or low contrast
- Add unnecessary gradients or 3D effects
- Use thin, delicate borders
- Overcomplicate layouts
- Use serif fonts (stick with Fredoka)
- Add drop shadows that look "realistic"
- Use pastel colors (use bold, saturated colors)
- Create soft, rounded corners everywhere

---

## Component-by-Component Checklist

- [ ] Buttons: Yellow with black border, bold text
- [ ] Cards: White background, thick black border, shadow
- [ ] Inputs: Black border, clear focus state
- [ ] Headers: Large, black text, bold weight
- [ ] Icons: Yellow background button with border
- [ ] Dropdowns: White background, border, yellow hover
- [ ] Page backgrounds: Yellow or white with clear borders
- [ ] Form labels: Black text, bold, uppercase
- [ ] Navigation: Yellow accents, black text
- [ ] Modals/Dialogs: White cards with borders
- [ ] Lists: Clear item separation with spacing
- [ ] Profile icons: Yellow background, centered icon

---

## File References

- **Tailwind Config**: `tailwind.config.ts` (font family)
- **Global Styles**: `src/index.css` (Fredoka font import)
- **Main Page Example**: `src/pages/Main.tsx` (reference implementation)
- **Reminders Page**: `src/pages/Reminders.tsx` (header with profile dropdown)

---

## Implementation Checklist for New Components

When creating new components, ensure:

1. [ ] All text is black on yellow or black on white
2. [ ] Buttons have yellow background with black text
3. [ ] Cards have white background with thick black borders
4. [ ] Icons use the yellow background with border style
5. [ ] No subtle colors or low-contrast elements
6. [ ] Font weights are bold (600+)
7. [ ] Spacing follows the established patterns
8. [ ] Hover states use color changes and transitions
9. [ ] Borders are visible and bold (minimum border-2)
10. [ ] Layout is clean and geometric

---

**Last Updated**: February 6, 2026
**Style Name**: Digital Brutalism
**Primary Inspirations**: Bold, high-contrast modern web design
