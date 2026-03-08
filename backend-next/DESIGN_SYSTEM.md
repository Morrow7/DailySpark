# DailySpark Design System Documentation

## 1. Color Palette (Cheese Theme)

### Primary Colors (Warm Yellows/Oranges)
| Name | Variable | Hex Value | Usage |
|------|----------|-----------|-------|
| Cheese 50 | `--color-primary-50` | `#fffbeb` | Page Backgrounds |
| Cheese 100 | `--color-primary-100` | `#fef3c7` | Secondary Backgrounds, Hover States |
| Cheese 200 | `--color-primary-200` | `#fde68a` | Borders, Dividers |
| Cheese 300 | `--color-primary-300` | `#fcd34d` | Active Borders, Icons |
| Cheese 400 | `--color-primary-400` | `#fbbf24` | Primary Buttons, Highlights |
| Cheese 500 | `--color-primary-500` | `#f59e0b` | Button Hover, Text Emphasis |
| Cheese 600 | `--color-primary-600` | `#d97706` | Darker Accents |

### Neutral Colors
| Name | Hex Value | Usage |
|------|-----------|-------|
| Gray 50 | `#f9fafb` | Surface Backgrounds |
| Gray 100 | `#f3f4f6` | Borders |
| Gray 400 | `#9ca3af` | Placeholder Text, Icons |
| Gray 500 | `#6b7280` | Secondary Text |
| Gray 800 | `#1f2937` | Headings |
| Gray 900 | `#111827` | Primary Text |

### Functional Colors
| Name | Hex Value | Usage |
|------|-----------|-------|
| Success | `#10b981` | Success Messages, Mastered Status |
| Warning | `#f59e0b` | Warnings, Review Status |
| Error | `#ef4444` | Error Messages |
| Info | `#3b82f6` | Information, Learning Status |

---

## 2. Typography

### Font Families
- **Headings**: `Nunito`, system-ui, sans-serif
- **Body**: `Geist Sans`, system-ui, sans-serif
- **Monospace**: `Geist Mono`, monospace (for phonetics)

### Type Scale
| Level | Size (px/rem) | Weight | Line Height | Usage |
|-------|---------------|--------|-------------|-------|
| H1 | 36px / 2.25rem | 800 (Extrabold) | 1.2 | Page Titles |
| H2 | 30px / 1.875rem | 700 (Bold) | 1.3 | Section Headers |
| H3 | 24px / 1.5rem | 700 (Bold) | 1.4 | Card Titles |
| Body | 16px / 1rem | 400 (Regular) | 1.5 | Standard Text |
| Small | 14px / 0.875rem | 500 (Medium) | 1.5 | Secondary Text |
| Tiny | 12px / 0.75rem | 500 (Medium) | 1.5 | Captions, Badges |

---

## 3. Spacing System (8pt Grid)

| Name | Size (rem) | Size (px) | Usage |
|------|------------|-----------|-------|
| 1 | 0.25rem | 4px | Tight spacing |
| 2 | 0.5rem | 8px | Component internal spacing |
| 3 | 0.75rem | 12px | Icon spacing |
| 4 | 1rem | 16px | Standard padding |
| 6 | 1.5rem | 24px | Section padding |
| 8 | 2rem | 32px | Container padding |
| 12 | 3rem | 48px | Section margins |

---

## 4. Component Library Specs

### Buttons
- **Primary Button**:
  - Background: `--color-primary-400`
  - Text: White (`#ffffff`)
  - Border Radius: `9999px` (Full)
  - Padding: `12px 24px`
  - Shadow: `0 4px 0 --color-primary-600` (3D effect)
  - Hover: `transform: translateY(-2px)`

### Cards
- **Standard Card**:
  - Background: White (`#ffffff`)
  - Border: 1px solid Gray 100 (`#f3f4f6`)
  - Border Radius: `24px` (`rounded-3xl`)
  - Shadow: `sm`
  - Hover: Border Yellow 300, Shadow Yellow 100/50

### Inputs
- **Search/Text Input**:
  - Background: White
  - Border: 2px solid Gray 100
  - Radius: `16px` (`rounded-2xl`)
  - Height: `56px`
  - Focus: Border Yellow 400, Ring Yellow 100

---

## 5. Interaction & Animation

- **Hover Effects**: `transition-all duration-300 ease-out`
- **Active States**: `scale-95` on click
- **Page Transitions**: `animate-fade-in` (opacity 0 -> 1)
- **Loading States**: Skeleton screens with `animate-pulse`

## 6. Iconography
- Library: `lucide-react`
- Style: Line icons with 2px - 2.5px stroke width
- Size: 18px (sm), 20px (md), 24px (lg)
