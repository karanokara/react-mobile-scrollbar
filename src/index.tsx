import React, { createRef } from "react";
import "./css/index.css";
import packageJson from "../package.json";
import { clamp, cn, isTouchDevice } from "./lib/Helper";
// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScrollbarStyles {
    track?: React.CSSProperties;
    thumb?: React.CSSProperties;
    thumbHover?: React.CSSProperties;
}

export interface ScrollbarAnimationOptions {
    /** ms to wait after mouse leave before fading out */
    fadeOutDelay?: number;
    /** css transition string for fade in */
    fadeInTransition?: string;
    /** css transition string for fade out */
    fadeOutTransition?: string;
}

export interface MyScrollbarProps {
    parentRef: React.RefObject<HTMLElement>;
    /** enable vertical scrollbar (default: true) */
    vertical?: boolean;
    /** enable horizontal scrollbar (default: true) */
    horizontal?: boolean;
    /** custom styles */
    styles?: ScrollbarStyles;
    /** animation options */
    animation?: ScrollbarAnimationOptions;
    /** track width for vertical bar (default: 8px) */
    trackSize?: number;
    autoHide?: boolean;
    trackInset?: number;
}

interface MyScrollbarState {
    // Vertical
    showVertical: boolean;
    thumbHeightRatio: number; // thumb height / track height
    thumbTopRatio: number; // thumb top / track height

    // Horizontal
    showHorizontal: boolean;
    thumbWidthRatio: number;
    thumbLeftRatio: number;

    // Visibility
    opacity: number;

    // Hover
    verticalThumbHovered: boolean;
    horizontalThumbHovered: boolean;
}


// ─── Component ───────────────────────────────────────────────────────────────

export default class MyScrollbar extends React.Component<MyScrollbarProps, MyScrollbarState> {
    private defaultClassName = packageJson.name;

    private thumbActiveClassName = "scrollbar-thumb-active";
    static defaultProps: Partial<MyScrollbarProps> = {
        vertical: true,
        horizontal: true,
        trackSize: 8,
        autoHide: true,
        animation: {
            fadeOutDelay: 3000,
            fadeInTransition: "opacity 0.3s ease",
            fadeOutTransition: "opacity 0.6s ease",
        },
    };

    // Refs
    private verticalTrackRef = createRef<HTMLDivElement>();
    private horizontalTrackRef = createRef<HTMLDivElement>();
    private verticalThumbRef = createRef<HTMLDivElement>();
    private horizontalThumbRef = createRef<HTMLDivElement>();

    // Drag state
    private isDraggingVertical = false;
    private isDraggingHorizontal = false;
    private dragStartY = 0;
    private dragStartX = 0;
    private dragStartScrollTop = 0;
    private dragStartScrollLeft = 0;

    // Timers
    private fadeOutTimer: ReturnType<typeof setTimeout> | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private mutationObserver: MutationObserver | null = null;

    // Touch device flag
    private isTouch = false;

    constructor(props: MyScrollbarProps) {
        super(props);
        this.state = {
            showVertical: false,
            thumbHeightRatio: 1,
            thumbTopRatio: 0,

            showHorizontal: false,
            thumbWidthRatio: 1,
            thumbLeftRatio: 0,

            opacity: props.autoHide ? 0 : 1,

            verticalThumbHovered: false,
            horizontalThumbHovered: false,
        };
    }

    // ─── Native Scrollbar Hide/Restore ─────────────────────────────────────────

    private originalOverflow = "";

    private styleTag: HTMLStyleElement | null = null;

    private hideNativeScrollbar(parent: HTMLElement) {
        // Store original styles
        this.originalOverflow = parent.style.overflow || "";

        // Make parent scrollable but hide native scrollbar via CSS trick
        // We inject a style that hides scrollbars for this element specifically
        const uid = `myscrollbar-${Math.random().toString(36).slice(2, 9)}`;
        parent.setAttribute("data-myscrollbar", uid);

        const style = document.createElement("style");
        style.textContent = `
      \[data-myscrollbar="${uid}"\]::-webkit-scrollbar {
        display: none;
      }
      \[data-myscrollbar="${uid}"\] {
        scrollbar-width: none;
        -ms-overflow-style: none;
        overflow: auto !important;
      }
    `;
        document.head.appendChild(style);
        this.styleTag = style;
    }

    private restoreNativeScrollbar(parent: HTMLElement) {
        parent.removeAttribute("data-myscrollbar");
        if (this.styleTag) {
            document.head.removeChild(this.styleTag);
            this.styleTag = null;
        }
        parent.style.overflow = this.originalOverflow;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private getParent(): HTMLElement | null {
        return this.props.parentRef.current;
    }

    private recalculate = () => {
        const parent = this.getParent();
        if (!parent) return;

        const {
            scrollHeight,
            clientHeight,
            scrollWidth,
            clientWidth,
            scrollTop,
            scrollLeft,
        } = parent;

        const { vertical = true, horizontal = true } = this.props;

        // Vertical
        const showVertical = vertical && scrollHeight > clientHeight + 1;
        const thumbHeightRatio = showVertical
            ? Math.max(clientHeight / scrollHeight, 0.05)
            : 1;
        const scrollableVertical = scrollHeight - clientHeight;
        const thumbTopRatio =
            scrollableVertical > 0 ? scrollTop / scrollableVertical : 0;

        // Horizontal
        const showHorizontal = horizontal && scrollWidth > clientWidth + 1;
        const thumbWidthRatio = showHorizontal
            ? Math.max(clientWidth / scrollWidth, 0.05)
            : 1;
        const scrollableHorizontal = scrollWidth - clientWidth;
        const thumbLeftRatio =
            scrollableHorizontal > 0 ? scrollLeft / scrollableHorizontal : 0;

        this.setState({
            showVertical,
            thumbHeightRatio,
            thumbTopRatio,
            showHorizontal,
            thumbWidthRatio,
            thumbLeftRatio,
        });
    };

    // ─── Scroll Handler ─────────────────────────────────────────────────────────

    private handleScroll = () => {
        const parent = this.getParent();
        if (!parent) return;

        const {
            scrollHeight,
            clientHeight,
            scrollWidth,
            clientWidth,
            scrollTop,
            scrollLeft,
        } = parent;

        const scrollableVertical = scrollHeight - clientHeight;
        const thumbTopRatio =
            scrollableVertical > 0 ? scrollTop / scrollableVertical : 0;

        const scrollableHorizontal = scrollWidth - clientWidth;
        const thumbLeftRatio =
            scrollableHorizontal > 0 ? scrollLeft / scrollableHorizontal : 0;

        this.setState({ thumbTopRatio, thumbLeftRatio });
    };

    // ─── Mutation Handler ───────────────────────────────────────────────────────

    private handleMutation = (mutations: MutationRecord[]) => {
        // Re-observe any new children
        const parent = this.getParent();
        if (!parent) return;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (
                    node instanceof Element &&
                    node !== this.verticalTrackRef.current &&
                    node !== this.horizontalTrackRef.current
                ) {
                    this.resizeObserver?.observe(node);
                }
            });
        });

        this.recalculate();
    };

    // ─── Mouse Enter/Leave Parent ───────────────────────────────────────────────

    private handleMouseEnterParent = () => {
        if (this.props.autoHide) {
            if (this.fadeOutTimer) {
                clearTimeout(this.fadeOutTimer);
                this.fadeOutTimer = null;
            }
            this.setState({ opacity: 1 });
        }
    };

    private handleMouseLeaveParent = () => {
        if (this.props.autoHide) {
            const { animation } = this.props;
            const delay = animation?.fadeOutDelay ?? 3000;

            if (this.fadeOutTimer) clearTimeout(this.fadeOutTimer);
            this.fadeOutTimer = setTimeout(() => {
                this.setState({ opacity: 0 });
            }, delay);
        }
        else {
            this.setState({ opacity: 1 });
        }
    };

    // ─── Track Click ────────────────────────────────────────────────────────────

    /**
     * Chrome behavior: clicking on the track scrolls by roughly one page
     * (clientHeight/clientWidth) toward the clicked position.
     */
    private handleVerticalTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent if clicking on thumb
        if (e.target === this.verticalThumbRef.current) return;

        const parent = this.getParent();
        const track = this.verticalTrackRef.current;
        if (!parent || !track) return;

        const trackRect = track.getBoundingClientRect();
        const clickRatio = (e.clientY - trackRect.top) / trackRect.height;

        const { scrollHeight, clientHeight, scrollTop } = parent;
        const targetScrollTop = clickRatio * (scrollHeight - clientHeight);

        // Scroll one page toward target (Chrome behavior)
        const pageSize = clientHeight;
        let newScrollTop: number;

        if (targetScrollTop > scrollTop) {
            newScrollTop = Math.min(scrollTop + pageSize, targetScrollTop);
        } else {
            newScrollTop = Math.max(scrollTop - pageSize, targetScrollTop);
        }

        parent.scrollTo({ top: newScrollTop, behavior: "smooth" });
    };

    private handleHorizontalTrackClick = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        if (e.target === this.horizontalThumbRef.current) return;

        const parent = this.getParent();
        const track = this.horizontalTrackRef.current;
        if (!parent || !track) return;

        const trackRect = track.getBoundingClientRect();
        const clickRatio = (e.clientX - trackRect.left) / trackRect.width;

        const { scrollWidth, clientWidth, scrollLeft } = parent;
        const targetScrollLeft = clickRatio * (scrollWidth - clientWidth);

        const pageSize = clientWidth;
        let newScrollLeft: number;

        if (targetScrollLeft > scrollLeft) {
            newScrollLeft = Math.min(scrollLeft + pageSize, targetScrollLeft);
        } else {
            newScrollLeft = Math.max(scrollLeft - pageSize, targetScrollLeft);
        }

        parent.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    };

    // ─── Drag ───────────────────────────────────────────────────────────────────

    private handleVerticalThumbMouseDown = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const parent = this.getParent();
        if (!parent) return;

        this.isDraggingVertical = true;
        this.dragStartY = e.clientY;
        this.dragStartScrollTop = parent.scrollTop;

        document.body.classList.add(this.thumbActiveClassName);
        this.forceUpdate();
    };

    private handleHorizontalThumbMouseDown = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const parent = this.getParent();
        if (!parent) return;

        this.isDraggingHorizontal = true;
        this.dragStartX = e.clientX;
        this.dragStartScrollLeft = parent.scrollLeft;

        document.body.classList.add(this.thumbActiveClassName);
        this.forceUpdate();
    };

    private handleMouseMove = (e: MouseEvent) => {
        const parent = this.getParent();
        if (!parent) return;

        if (this.isDraggingVertical) {
            const track = this.verticalTrackRef.current;
            if (!track) return;

            const deltaY = e.clientY - this.dragStartY;
            const trackHeight = track.clientHeight;
            const { scrollHeight, clientHeight } = parent;

            // Convert pixel delta in track space to scroll delta
            const scrollRatio = (scrollHeight - clientHeight) / (trackHeight * (1 - this.state.thumbHeightRatio));
            const newScrollTop = this.dragStartScrollTop + deltaY * scrollRatio;

            parent.scrollTop = clamp(newScrollTop, 0, scrollHeight - clientHeight);
        }

        if (this.isDraggingHorizontal) {
            const track = this.horizontalTrackRef.current;
            if (!track) return;

            const deltaX = e.clientX - this.dragStartX;
            const trackWidth = track.clientWidth;
            const { scrollWidth, clientWidth } = parent;

            const scrollRatio = (scrollWidth - clientWidth) / (trackWidth * (1 - this.state.thumbWidthRatio));
            const newScrollLeft = this.dragStartScrollLeft + deltaX * scrollRatio;

            parent.scrollLeft = clamp(newScrollLeft, 0, scrollWidth - clientWidth);
        }
    };

    private handleMouseUp = () => {
        if (this.isDraggingVertical || this.isDraggingHorizontal) {
            this.isDraggingVertical = false;
            this.isDraggingHorizontal = false;
            document.body.classList.remove(this.thumbActiveClassName);
            this.forceUpdate();
        }
    };

    // ─── Thumb Hover ────────────────────────────────────────────────────────────

    private handleVerticalThumbMouseEnter = () => {
        this.setState({ verticalThumbHovered: true });
    };

    private handleVerticalThumbMouseLeave = () => {
        this.setState({ verticalThumbHovered: false });
    };

    private handleHorizontalThumbMouseEnter = () => {
        this.setState({ horizontalThumbHovered: true });
    };

    private handleHorizontalThumbMouseLeave = () => {
        this.setState({ horizontalThumbHovered: false });
    };

    // ─── Lifecycle ─────────────────────────────────────────────────────────────

    componentDidUpdate(prevProps: MyScrollbarProps) {
        // If parentRef changed
        if (prevProps.parentRef !== this.props.parentRef) {
            this.recalculate();
        }

        if (prevProps.autoHide !== this.props.autoHide) {
            this.handleMouseLeaveParent();
        }
    }

    componentDidMount() {
        this.isTouch = isTouchDevice();
        if (this.isTouch) return; // Use native scrollbar on touch devices

        const parent = this.getParent();
        if (!parent) return;

        // Hide native scrollbar
        this.hideNativeScrollbar(parent);

        // Initial calculation
        this.recalculate();

        // Attach scroll listener
        parent.addEventListener("scroll", this.handleScroll, { passive: true });

        // Mouse enter/leave on parent
        parent.addEventListener("mouseenter", this.handleMouseEnterParent);
        parent.addEventListener("mouseleave", this.handleMouseLeaveParent);

        // ResizeObserver for parent and content
        this.resizeObserver = new ResizeObserver(this.recalculate);
        this.resizeObserver.observe(parent);

        // Observe children for content changes
        Array.from(parent.children).forEach((child) => {
            if (child !== this.verticalTrackRef.current &&
                child !== this.horizontalTrackRef.current) {
                this.resizeObserver?.observe(child);
            }
        });

        // MutationObserver for DOM changes inside parent
        this.mutationObserver = new MutationObserver(this.handleMutation);
        this.mutationObserver.observe(parent, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        // Global mouse move/up for drag
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    componentWillUnmount() {
        if (this.isTouch) return;

        const parent = this.getParent();
        if (parent) {
            parent.removeEventListener("scroll", this.handleScroll);
            parent.removeEventListener("mouseenter", this.handleMouseEnterParent);
            parent.removeEventListener("mouseleave", this.handleMouseLeaveParent);
            this.restoreNativeScrollbar(parent);
        }

        this.resizeObserver?.disconnect();
        this.mutationObserver?.disconnect();

        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleMouseUp);

        if (this.fadeOutTimer) clearTimeout(this.fadeOutTimer);
    }


    // ─── Render ─────────────────────────────────────────────────────────────────

    render() {
        // Don't render on touch devices
        if (this.isTouch) return null;

        const {
            styles,
            animation,
            trackSize,
            vertical = true,
            horizontal = true,
            trackInset = 0,
        } = this.props;

        const {
            showVertical,
            thumbHeightRatio,
            thumbTopRatio,
            showHorizontal,
            thumbWidthRatio,
            thumbLeftRatio,
            opacity,
            verticalThumbHovered,
            horizontalThumbHovered,
        } = this.state;

        const fadeInTransition =
            animation?.fadeInTransition ?? "opacity 0.3s ease";
        const fadeOutTransition =
            animation?.fadeOutTransition ?? "opacity 0.6s ease";

        const currentTransition =
            opacity === 1 ? fadeInTransition : fadeOutTransition;

        // ── Default styles ──

        const defaultTrackStyle: React.CSSProperties = {
            backgroundColor: "transparent",
        };

        const defaultThumbStyle: React.CSSProperties = {
            backgroundColor: "#aaaaaa",
        };

        const defaultThumbHoverStyle: React.CSSProperties = {
            backgroundColor: "#cccccc",
        };

        // ── Merged styles ──

        const trackStyle: React.CSSProperties = {
            ...defaultTrackStyle,
            ...(styles?.track ?? {}),
        };

        const thumbBaseStyle: React.CSSProperties = {
            ...defaultThumbStyle,
            ...(styles?.thumb ?? {}),
        };

        const thumbHoverStyle: React.CSSProperties = {
            ...defaultThumbHoverStyle,
            ...(styles?.thumbHover ?? {}),
        };

        // ── Visibility ──

        const containerStyle: React.CSSProperties = {
            opacity,
            transition: currentTransition,
            pointerEvents: opacity === 0 ? "none" : "auto",
        };

        // ── Vertical scrollbar ──

        const verticalTrackStyle: React.CSSProperties = {
            position: "absolute",
            top: 0,
            right: 0,
            width: `${trackSize}px`,
            height: showHorizontal ? `calc(100% - ${trackSize}px)` : "100%",
            display: showVertical && vertical ? "block" : "none",
            zIndex: 999,
            boxSizing: "border-box",
            ...trackStyle,
        };

        const thumbHeight = `${thumbHeightRatio * 100}%`;
        const thumbTop = `${thumbTopRatio * (100 - thumbHeightRatio * 100)}%`;

        const verticalThumbStyle: React.CSSProperties = {
            position: "absolute",
            width: "100%",
            left: 0,
            height: thumbHeight,
            top: thumbTop,
            boxSizing: "border-box",
            ...((verticalThumbHovered || this.isDraggingVertical)
                ? { ...thumbBaseStyle, ...thumbHoverStyle }
                : thumbBaseStyle),
        };

        // ── Horizontal scrollbar ──

        const horizontalTrackStyle: React.CSSProperties = {
            position: "absolute",
            bottom: 0,
            left: 0,
            height: `${trackSize}px`,
            width: showVertical ? `calc(100% - ${trackSize}px)` : "100%",
            display: showHorizontal && horizontal ? "block" : "none",
            zIndex: 999,
            boxSizing: "border-box",
            ...trackStyle,
        };

        const thumbWidth = `${thumbWidthRatio * 100}%`;
        const thumbLeft = `${thumbLeftRatio * (100 - thumbWidthRatio * 100)}%`;

        const horizontalThumbStyle: React.CSSProperties = {
            position: "absolute",
            height: "100%",
            top: 0,
            width: thumbWidth,
            left: thumbLeft,
            boxSizing: "border-box",
            ...((horizontalThumbHovered || this.isDraggingHorizontal)
                ? { ...thumbBaseStyle, ...thumbHoverStyle }
                : thumbBaseStyle),
        };

        return (
            <>
                {/* Vertical Scrollbar */}
                {vertical && (
                    <div className={cn(this.defaultClassName, "vertical")} style={{ ...containerStyle, ...verticalTrackStyle }}>
                        <div
                            ref={this.verticalTrackRef}
                            style={{ position: "absolute", inset: trackInset + "px" }}
                            onClick={this.handleVerticalTrackClick}
                        >
                            <div
                                ref={this.verticalThumbRef}
                                style={verticalThumbStyle}
                                onMouseDown={this.handleVerticalThumbMouseDown}
                                onMouseEnter={this.handleVerticalThumbMouseEnter}
                                onMouseLeave={this.handleVerticalThumbMouseLeave}
                            />
                        </div>
                    </div>
                )}

                {/* Horizontal Scrollbar */}
                {horizontal && (
                    <div className={cn(this.defaultClassName, "horizontal")} style={{ ...containerStyle, ...horizontalTrackStyle }}>
                        <div
                            ref={this.horizontalTrackRef}
                            style={{ position: "absolute", inset: trackInset + "px" }}
                            onClick={this.handleHorizontalTrackClick}
                        >
                            <div
                                ref={this.horizontalThumbRef}
                                style={horizontalThumbStyle}
                                onMouseDown={this.handleHorizontalThumbMouseDown}
                                onMouseEnter={this.handleHorizontalThumbMouseEnter}
                                onMouseLeave={this.handleHorizontalThumbMouseLeave}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }
}
