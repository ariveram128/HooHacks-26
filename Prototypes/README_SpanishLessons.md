# Sendero Verde — React Native Lessons Screen

## Quick Start

### 1. Install dependencies

**React Native CLI:**
```bash
npm install react-native-svg react-native-linear-gradient
cd ios && pod install && cd ..
```

**Expo:**
```bash
npx expo install react-native-svg expo-linear-gradient
```

> If using **expo-linear-gradient**, open `SpanishLessonsScreen.tsx` and swap the import at the top:
> ```ts
> // comment this out:
> // import LinearGradient from 'react-native-linear-gradient';
>
> // uncomment this:
> import { LinearGradient } from 'expo-linear-gradient';
> ```

### 2. Drop the file in

Copy `SpanishLessonsScreen.tsx` into your project (e.g. `src/screens/`).

### 3. Use it

```tsx
import SpanishLessonsScreen from './screens/SpanishLessonsScreen';

// In your navigator or root:
<SpanishLessonsScreen />
```

### 4. Hook up navigation

Inside `SpanishLessonsScreen.tsx`, find the `handleLessonPress` function and wire it to your navigation:

```ts
const handleLessonPress = (lesson: Lesson) => {
  navigation.navigate('LessonDetail', { lessonId: lesson.id });
};
```

## What's included

| Feature | Implementation |
|---|---|
| Vine path | SVG sine-wave drawn with `react-native-svg` |
| Animated leaves | `Animated` API — fade-in + sway loop |
| Fireflies | `Animated` opacity + translate loop |
| Lesson cards | `LinearGradient` + spring press animation |
| Current lesson shimmer | Pulsing overlay via `Animated.timing` |
| Progress bar | Animated width interpolation |
| Auto-scroll to current | `ScrollView.scrollTo` on mount |
| XP badges & stars | SVG star paths + absolute positioned badges |

## Customization

- **Add/remove lessons** — edit the `LESSONS` array
- **Adjust vine curve** — tweak `AMPLITUDE`, `FREQUENCY`, `NODE_SPACING` constants
- **Change colors** — update `LEAF_COLORS`, gradient arrays, and the `borderColor`/`gradientColors` in `LessonNode`
- **Card width** — change `styles.card.width` and the `nodeLeft` calculation in `LessonNode`

## TypeScript

The file is written in TypeScript (`.tsx`). If your project uses plain JS, rename to `.jsx` and remove the type annotations.
