import React from 'react';

type ButtonType =
    | 'primary'
    | 'transparent'
    | 'gray'
    | 'danger'
    | 'success'
    | 'lightgray'
    | 'graydisabled'
    | 'admin';

const buttonStyles: Record<ButtonType, string> = {
    primary: 'bg-teal-700 hover:bg-teal-800 focus:ring-teal-400',
    transparent:
        'bg-transparent text-blue-400 hover:bg-slate-500/20 focus:ring-blue-600',
    gray: 'bg-zinc-600 hover:bg-zinc-700 focus:ring-zinc-400',
    graydisabled: 'bg-zinc-600',
    success: 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-400',
    danger: 'bg-red-700 hover:bg-red-800 focus:ring-red-400',
    lightgray: 'bg-zinc-500 hover:bg-zinc-600 focus:ring-zinc-300',
    admin: 'bg-indigo-700 hover:bg-indigo-800 focus:ring-indigo-400',
};

const Button: React.FC<any> = (props: {
    className: string;
    colorType: ButtonType;
    alignedLeft: boolean;
    fullWidth: boolean;
}) => {
    const {
        className,
        colorType = 'primary',
        alignedLeft,
        fullWidth,
        ...other
    } = props;

    return (
        <button
            type="button"
            className={`flex items-center rounded-lg px-8 py-2 text-lg font-medium focus:outline-none focus:ring-4 ${
                alignedLeft ? 'justify-start' : 'justify-center'
            } ${fullWidth ? 'w-full' : ''} ${buttonStyles[colorType]} ${
                className && className.length > 0 ? className : ''
            }`}
            {...other}
        />
    );
};

export default Button;
