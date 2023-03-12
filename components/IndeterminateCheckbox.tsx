import React from 'react';

export enum CheckboxState {
    CHECKED,
    UNCHECKED,
    INDETERMINATE,
}

export default function IndeterminateCheckbox(props: {
    id?: string;
    className?: string;
    value: CheckboxState;
    [key: string]: any;
}) {
    const { value, id, className, ...otherProps } = props;
    const checkRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if (!checkRef.current) {
            return;
        }

        checkRef.current.checked = value === CheckboxState.CHECKED;
        checkRef.current.indeterminate = value === CheckboxState.INDETERMINATE;
    }, [value]);
    return (
        <input
            id={id}
            className={className}
            type="checkbox"
            ref={checkRef}
            {...otherProps}
        />
    );
}
