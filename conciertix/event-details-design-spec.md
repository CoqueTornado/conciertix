Design Specification: Event Details Page (Conciertix)

1. Overall Philosophy & Aesthetic:

Core Principle: Clean, sophisticated, premium, and intuitive, drawing inspiration from Apple's Human Interface Guidelines (iOS/macOS).

Focus: Minimalism, clarity, intelligent use of white space, and exceptional legibility.

Feel: The page should feel like a native application experience – responsive, fluid, and polished. Every element should feel intentional.

2. Layout & Structure:

Type: Single, well-organized, vertically scrolling page.

Content Flow: Logical progression of information, guiding the user's eye downwards.

Visual Hierarchy: Clear distinction between primary, secondary, and tertiary information through size, weight, color, and spacing.

Responsive Design: The layout must adapt gracefully to various screen sizes (desktop, tablet, mobile), maintaining the premium feel.

High-Level Page Structure:

graph TD
    A[Page Container: Full Width, Centered Content] --> B(Main Event Image / Video Banner);
    B --> C{Event Core Information Section};
    C --> C1[Event Title];
    C --> C2[Date & Time];
    C --> C3[Location Name & City];
    C --> D(Primary Call to Action: Reserve Tickets Button);
    D --> E(Event Description Section);
    E --> F(Speakers / Performers Section);
    F --> F1[Speaker/Performer 1: Photo, Name (expandable bio)];
    F --> F2[Speaker/Performer 2: Photo, Name (expandable bio)];
    F --> Fx[... more speakers/performers ...];
    Fx --> G(Venue Details & Map Section);
    G --> G1[Venue Name & Full Address];
    G --> G2[Minimally Styled Interactive Map];
    G2 --> H(Secondary Information / Gallery Placeholder);

    style A fill:#f9f9f9,stroke:#ddd,stroke-width:2px
    style B fill:#e9e9e9,stroke:#ccc,stroke-width:1px
    style C fill:#fff,stroke:#ccc,stroke-width:1px,rx:8,ry:8
    style D fill:#007AFF,stroke:#007AFF,stroke-width:1px,color:#fff,rx:8,ry:8
    style E fill:#fff,stroke:#ccc,stroke-width:1px,rx:8,ry:8
    style F fill:#fff,stroke:#ccc,stroke-width:1px,rx:8,ry:8
    style G fill:#fff,stroke:#ccc,stroke-width:1px,rx:8,ry:8
    style H fill:#f0f0f0,stroke:#ddd,stroke-width:1px,rx:8,ry:8


3. Visual Design:

Color Palette:

Primary Background: White (#FFFFFF) or a very light off-white/gray (e.g., #F9F9F9 or #F2F2F7 - Apple's light gray).

Primary Text: Near-black (e.g., #1D1D1F - Apple's primary text color) for body copy and important text.

Secondary Text: Shades of gray (e.g., #8A8A8E or #6E6E73) for less important details, labels, and captions.

Accent Color: A vibrant, refined blue (e.g., Apple's #007AFF) for primary CTAs, links, and active states. Potentially a secondary subtle accent if needed.

Separators/Borders: Very light, subtle grays (e.g., #E5E5EA or #D1D1D6).

Container Backgrounds (if distinct sections): Slightly darker off-white or light gray than the main page background to create subtle depth, or utilize shadows.

Typography:

Primary Font Family:

Ideal: San Francisco (SF Pro Text, SF Pro Display).

Web-safe Alternatives:

Inter (already in use via frontend/src/index.css, an excellent choice, very similar to SF).

System UI fonts: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif. This is already the fallback in frontend/src/index.css.

Font Weights & Styles:

Page Title (Event Name): Large, prominent. Inter Bold or SF Pro Display Bold, e.g., 32-48px (desktop), scaled down for mobile.

Section Headings (e.g., "Description", "Performers"): Inter SemiBold or SF Pro Text Semibold, e.g., 20-28px.

Body Text (Description, Bios): Inter Regular or SF Pro Text Regular, e.g., 16-18px, with generous line height (e.g., 1.5-1.7).

Labels & Captions (Date, Time, Location details): Inter Regular or SF Pro Text Regular/Medium, e.g., 13-15px, often in a secondary text color.

Button Text: Inter Medium or SF Pro Text Medium/Semibold, e.g., 15-17px.

Iconography:

Style: Clean, minimalist, line-art style, consistent with Apple's SF Symbols.

Usage: Sparingly, for UI elements like "expand bio" chevrons, map pins, possibly for date/time/location indicators if done subtly.

Color: Match text color or accent color depending on context.

Consider using SVG icons for scalability and sharpness.

Imagery/Video Presentation:

Main Event Image/Video:

Prominently displayed, often full-width or near full-width at the top of the content area.

Aspect Ratio: Maintain a common aspect ratio (e.g., 16:9 or 3:2).

If video, it should be presented cleanly, possibly with a custom play button overlaying a poster image until clicked. YouTube/Vimeo embeds preferred.

Placeholder: If no image/video, use a clean, minimalist SVG placeholder or a solid light gray background with a subtle icon (e.g., a generic "event" or "image" icon). Avoid overly distracting text like "Image not available" if possible, let the context imply it.

Spacing & Grids:

Generous use of white space is critical.

Employ a consistent spacing scale (e.g., multiples of 4px or 8px) for margins and paddings.

A soft underlying grid (e.g., 8pt grid) can help align elements, but visual balance is key.

4. Component Design & Interaction:

Main Event Image/Video Banner:

Often the first major visual element. Can have a subtle parallax scroll effect or a gentle zoom on page load.

If video, it should load efficiently.

Event Core Information Section (typically below or overlaid subtly on the banner):

Event Title: Largest text on the page, clear and immediately readable.

Date & Time: Clearly formatted (e.g., "Sat, Nov 23, 2025 • 7:00 PM – 10:00 PM"). Consider using icons (calendar, clock) very subtly if they enhance clarity without adding clutter.

Location Name & City: (e.g., "The Grand Hall • New York, NY").

All these elements should be grouped logically with clear visual hierarchy.

Primary Call to Action (CTA - "Reserve Tickets"):

Button Design:

Shape: Rounded rectangle, similar to Apple's buttons (e.g., 8-10px border-radius).

Size: Prominent, but not overwhelming. Sufficient padding.

Color: Accent color (e.g., #007AFF) for background, white text.

Typography: Clear, legible (see Typography section).

States:

Default: Accent color background.

Hover: Slightly darker shade of accent color or subtle scale-up.

Active/Pressed: Even darker shade or subtle inset shadow.

Disabled (e.g., event.availableTickets === 0 or reservationLoading): Grayed out (e.g., light gray background, medium gray text), non-interactive. Text should change to "Sold Out" or "Reserving...".

Placement: Strategically placed for high visibility, often after the core event info.

Ticket Selection (if availableTickets > 0 and before CTA):

Quantity Input: Clean, simple numerical input. +/- buttons can be used for quick adjustment. Styled to match the overall aesthetic.

Label: "Quantity" or similar, clear and concise.

Event Description Section:

Typography: Focus on readability (font size, line height).

"Read More": If descriptions are long, consider truncating with a "Read More" link/button that smoothly expands the content. The transition should be fluid.

Speakers/Performers Section:

Layout: A horizontal scrolling row or a clean grid.

Individual Performer Card/Item:

Photo: Circular or rounded square mask for the photo. High-quality images preferred. Placeholder if no photo.

Name: Clearly displayed below or next to the photo.

Expandable Bio: A small "info" icon or "Bio" text link that, on click, smoothly reveals a short bio below the performer's name or in a small pop-over/modal. The expansion should be animated.

Link to Detailed Page: If name/photo is clicked, navigate to the full artist page (if it exists) with a smooth page transition.

Venue Details & Map Section:

Venue Info: Clearly list Venue Name and Full Address.

Map:

Integrate the Leaflet map.

Styling: Minimalist. Consider a grayscale map tile layer initially, with subtle color accents for the marker or route if displayed.

Controls (zoom) should be styled to match the Apple aesthetic if possible, or kept very minimal.

The map container should have clean borders or blend seamlessly.

Image/Video Gallery (Placeholder as per current code):

A simple, unobtrusive text message like "More media coming soon." or a visually quiet placeholder section.

5. Animations & Microinteractions:

Page Load/Transitions:

Elements can fade in sequentially or with a slight stagger as the page loads.

If navigating from another page, consider a smooth cross-fade or slide-in transition for the entire page.

Scroll Animations:

Subtle Parallax: On the main image banner.

Reveal on Scroll: Content sections (Description, Performers, Venue) can gently fade in and slide up as they enter the viewport.

Hover Effects:

Buttons/CTAs: Subtle change in background color, brightness, or a slight lift/scale (as described in CTA section).

Performer Cards: Slight lift, subtle shadow increase, or a gentle zoom on the photo.

Links: Color change (as per standard link interaction).

Click Feedback:

Buttons: Visual change on press (darker, inset).

Interactive elements: Provide immediate visual confirmation.

Expand/Collapse (e.g., Performer Bios, "Read More"):

Smooth animated transitions for height/opacity changes. Use prefers-reduced-motion media query to disable or reduce animations for users who prefer it.

Loading States:

General Page Load: A very subtle, minimalist loading indicator if initial data fetch is slow (e.g., a thin progress bar at the top or a gentle pulsing animation on a key element). Avoid jarring full-screen spinners unless absolutely necessary.

Reservation Process: The "Reserve Now" button should transition to a "Reserving..." state with a subtle spinner inside or next to the text. The button should be disabled during this.

Image Loading: Graceful fading in of images once loaded. Use of LQIP (Low-Quality Image Placeholders) or dominant color placeholders can enhance this.

6. Accessibility Considerations:

Color Contrast: Ensure sufficient contrast between text and background colors (WCAG AA minimum).

Keyboard Navigation: All interactive elements must be focusable and operable via keyboard. Focus states should be clear and visually distinct (Apple's blue ring focus indicator is a good reference).

Semantic HTML: Use appropriate HTML5 tags for structure.

ARIA Attributes: Where necessary, use ARIA roles and properties to enhance accessibility for screen reader users (e.g., for expandable sections, custom controls).

Alternative Text: Provide meaningful alt text for all images.

Reduced Motion: Respect prefers-reduced-motion for animations.