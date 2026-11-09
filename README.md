
# React Mobile Scrollbar

A mobile-like scrollbar for websites on desktop and then just use default scrollbar on touchable devices.

It is lightweight, highly customizable, and smooth custom scrollbar component built with React and TypeScript.

It offers native-like scrolling momentum, auto-hide behavior, and deep styling flexibility for both vertical and horizontal scroll containers.

## Features

* 🚀 **TypeScript Ready**: Fully typed component and configuration interfaces out-of-the-box.

* 📱 **Smooth & Natural**: Custom track clicks, drag-to-scroll support, and wheel event bridging.

* 🎨 **Fully Customizable Styles**: Tailor the bar, track, thumb, and hover states using standard React `CSSProperties`.

* ✨ **Configurable Animations**: Fine-tune fade-out delays and custom CSS transition effects.

* ⚙️ **Automatic Observation**: Built-in `ResizeObserver` and `MutationObserver` to handle dynamic content changes seamlessly.

## Installation

```
npm install react-mobile-scrollbar
# or
yarn add react-mobile-scrollbar

```

## Usage Example

Below is a quick example of how to integrate `ReactMobileScrollbar` with a scrollable wrapper element using a React ref:

```
import React, { useRef } from "react";
import { ReactMobileScrollbar } from "react-mobile-scrollbar";

export default function App() {
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: "relative", width: "400px", height: "300px", border: "1px solid #ccc", }}>
      {/* Scrollable Container */}
      <div
        className="scroll-wrapper react-mobile-scrollbar-container" // add this class 'react-mobile-scrollbar-container'
        ref={scrollWrapperRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        <div className="scroll-content" style={{ width: "800px", height: "600px", padding: "20px" }}>
          <h2>Scrollable Content Area</h2>
          <p>Try scrolling vertically or horizontally to see the custom scrollbar in action!</p>
        </div>
      </div>

      {/* Custom Scrollbar Component */}
      <ReactMobileScrollbar
        scrollWrapperRef={scrollWrapperRef}
        autoHide={true}
        barSize={8}
        styles={{
          thumb: { backgroundColor: "rgba(0, 0, 0, 0.3)", borderRadius: "4px" },
          thumbHover: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          track: { background: "transparent" },
        }}
      />
    </div>
  );
}

```

## API Reference & Props

### `ReactMobileScrollbarProps`

| Property           | Type                                                      | Default      | Description                                                              |
| ------------------ | --------------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `scrollWrapperRef` | `React.RefObject<HTMLElement>`                            | **Required** | Reference to the scrollable wrapper element.                             |
| `enabled`          | `boolean`                                                 | `true`       | Enable or disable the custom scrollbar behavior.                         |
| `vertical`         | `boolean`                                                 | `true`       | Enable vertical scrollbar rendering and handling.                        |
| `horizontal`       | `boolean`                                                 | `true`       | Enable horizontal scrollbar rendering and handling.                      |
| `barSize`          | `number`                                                  | `8`          | Track width/size for the vertical/horizontal bars (in pixels).           |
| `autoHide`         | `boolean`                                                 | `false`      | Automatically hide the scrollbar when not actively scrolling or hovered. |
| `trackInset`       | `number`                                                  | —            | Inset style offset of the track.                                         |
| `styles`           | [`ScrollbarStyles`](#scrollbarstyles)                     | —            | Custom CSS styles for the bar elements.                                  |
| `animation`        | [`ScrollbarAnimationOptions`](#scrollbaranimationoptions) | —            | Animation timing configuration.                                          |

### `ScrollbarStyles`

```
export interface ScrollbarStyles {
    bar?: React.CSSProperties;
    track?: React.CSSProperties;
    thumb?: React.CSSProperties;
    thumbHover?: React.CSSProperties;
}

```

### `ScrollbarAnimationOptions`

```
export interface ScrollbarAnimationOptions {
    /** Milliseconds to wait after mouse leave before fading out */
    fadeOutDelay?: number;
    /** CSS transition string for fade in */
    fadeInTransition?: string;
    /** CSS transition string for fade out */
    fadeOutTransition?: string;
}

```

## License

MIT ©KaraNoKara
