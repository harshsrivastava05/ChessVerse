interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
}

export const Button = ({
    children,
    className = "",
    variant = 'primary',
    ...props
}: ButtonProps) => {
    const baseStyles = "px-8 py-4 text-xl font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg";

    const variants = {
        primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20",
        secondary: "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/20",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-red-900/20",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
