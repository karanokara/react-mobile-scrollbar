import React, {
    forwardRef,
    useState,
    useRef,
    useEffect,
    useCallback,
    useImperativeHandle,
    type InputHTMLAttributes,
    type ChangeEvent,
} from 'react';
import './css/InputNumber.css';

export interface InputNumberProps
    extends Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'onChange' | 'value' | 'defaultValue' | 'type' | 'size'
    > {
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    controls?: boolean;
    size?: 'small' | 'middle' | 'large';
    onChange?: (value: number | null) => void;
    wrapperStyle?: React.CSSProperties;
    className?: string;
}

const isIntermediateValue = (val: string) =>
    val === '' || val === '-' || val === '.' || val === '-.';

const isValidNumberString = (val: string) =>
    isIntermediateValue(val) || /^-?\d*\.?\d*$/.test(val);

const clamp = (num: number, min?: number, max?: number) => {
    let result = num;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
};

const getStepPrecision = (step: number) => {
    const str = String(step);
    const dotIndex = str.indexOf('.');
    return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
};

const toPrecision = (num: number, precision?: number) => {
    if (precision === undefined) return num;
    return parseFloat(num.toFixed(precision));
};

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
    (
        {
            value,
            defaultValue,
            min,
            max,
            step = 1,
            precision,
            controls = true,
            size = 'middle',
            disabled,
            readOnly,
            onChange,
            onBlur,
            onFocus,
            onKeyDown,
            className = '',
            wrapperStyle,
            ...restProps
        },
        ref
    ) => {
        const isControlled = value !== undefined;
        const [internalValue, setInternalValue] = useState<number | null>(
            defaultValue !== undefined ? defaultValue : null
        );
        const currentValue = isControlled ? value ?? null : internalValue;

        const [displayValue, setDisplayValue] = useState<string>(
            currentValue !== null && currentValue !== undefined ? String(currentValue) : ''
        );

        const inputRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        const timerRef = useRef<number | null>(null);
        const speedRef = useRef<number>(300);

        // Keep display in sync when the controlled value changes externally
        useEffect(() => {
            if (currentValue === null || currentValue === undefined) {
                setDisplayValue('');
            } else {
                setDisplayValue(String(currentValue));
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currentValue]);

        const updateValue = useCallback(
            (newValue: number | null) => {
                if (!isControlled) setInternalValue(newValue);
                onChange?.(newValue);
            },
            [isControlled, onChange]
        );

        const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (!isValidNumberString(val)) return;

            setDisplayValue(val);

            if (isIntermediateValue(val)) {
                updateValue(null);
                return;
            }

            const parsed = parseFloat(val);
            if (!isNaN(parsed)) updateValue(parsed);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (isIntermediateValue(displayValue)) {
                setDisplayValue('');
                updateValue(null);
            } else {
                let parsed = parseFloat(displayValue);
                if (!isNaN(parsed)) {
                    parsed = clamp(parsed, min, max);
                    parsed = toPrecision(parsed, precision);
                    setDisplayValue(String(parsed));
                    updateValue(parsed);
                }
            }
            onBlur?.(e);
        };

        const changeStep = useCallback(
            (dir: 1 | -1) => {
                if (disabled || readOnly) return;
                const base = currentValue ?? 0;
                let next = base + dir * step;
                next = clamp(next, min, max);
                next = toPrecision(next, precision ?? getStepPrecision(step));
                setDisplayValue(String(next));
                updateValue(next);
            },
            [currentValue, step, min, max, precision, disabled, readOnly, updateValue]
        );

        const stopContinuousChange = () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            speedRef.current = 300;
        };

        const startContinuousChange = (dir: 1 | -1) => {
            changeStep(dir);
            speedRef.current = 300;
            const loop = () => {
                changeStep(dir);
                speedRef.current = Math.max(50, speedRef.current - 40);
                timerRef.current = window.setTimeout(loop, speedRef.current);
            };
            timerRef.current = window.setTimeout(loop, speedRef.current);
        };

        useEffect(() => () => stopContinuousChange(), []);

        const handleUpMouseDown = (e: React.MouseEvent) => {
            e.preventDefault();
            if (disabled || readOnly) return;
            inputRef.current?.focus();
            startContinuousChange(1);
        };

        const handleDownMouseDown = (e: React.MouseEvent) => {
            e.preventDefault();
            if (disabled || readOnly) return;
            inputRef.current?.focus();
            startContinuousChange(-1);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                changeStep(1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                changeStep(-1);
            }
            onKeyDown?.(e);
        };

        const isAtMax = max !== undefined && currentValue !== null && currentValue >= max;
        const isAtMin = min !== undefined && currentValue !== null && currentValue <= min;

        return (
            <div
                className={[
                    'input-number-wrapper',
                    `input-number-${size}`,
                    disabled ? 'input-number-disabled' : '',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
                style={wrapperStyle}
            >
                <input
                    {...restProps}
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    className="input-number-input"
                    value={displayValue}
                    disabled={disabled}
                    readOnly={readOnly}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={onFocus}
                    onKeyDown={handleKeyDown}
                />
                {controls && (
                    <div className="input-number-handler-wrap">
                        <span
                            role="button"
                            aria-label="increase"
                            className={[
                                'input-number-handler',
                                'input-number-handler-up',
                                isAtMax || disabled || readOnly ? 'input-number-handler-disabled' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            onMouseDown={handleUpMouseDown}
                            onMouseUp={stopContinuousChange}
                            onMouseLeave={stopContinuousChange}
                        >
                            <svg viewBox="0 0 12 12" width="8" height="8" aria-hidden="true">
                                <path
                                    d="M1.5 8L6 3.5L10.5 8"
                                    stroke="currentColor"
                                    strokeWidth="1.3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                        <span
                            role="button"
                            aria-label="decrease"
                            className={[
                                'input-number-handler',
                                'input-number-handler-down',
                                isAtMin || disabled || readOnly ? 'input-number-handler-disabled' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            onMouseDown={handleDownMouseDown}
                            onMouseUp={stopContinuousChange}
                            onMouseLeave={stopContinuousChange}
                        >
                            <svg viewBox="0 0 12 12" width="8" height="8" aria-hidden="true">
                                <path
                                    d="M1.5 4L6 8.5L10.5 4"
                                    stroke="currentColor"
                                    strokeWidth="1.3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </div>
                )}
            </div>
        );
    }
);

InputNumber.displayName = 'InputNumber';

export default InputNumber;
