import React from 'react';

export enum CheckboxState {
    CHECKED,
    UNCHECKED,
    INDETERMINATE,
}

const IndeterminateCheckbox: React.FC<any> = (props: {
    value: CheckboxState;
}) => {
    const { value, ...otherProps } = props;
    const checkRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if (!checkRef.current) {
            return;
        }

        checkRef.current.checked = value === CheckboxState.CHECKED;
        checkRef.current.indeterminate = value === CheckboxState.INDETERMINATE;
    }, [value]);
    return <input type="checkbox" ref={checkRef} {...otherProps} />;
};

export default IndeterminateCheckbox;
