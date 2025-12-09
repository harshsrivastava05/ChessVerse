export const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-slate-800 rounded-full opacity-20 animate-ping"></div>
                <img
                    src="/N copy.png"
                    alt="Loading..."
                    className="w-16 h-16 object-contain relative z-10 animate-bounce"
                    style={{ animationDuration: '0.8s' }}
                />
            </div>
            <div className="mt-4 text-slate-400 font-mono text-sm animate-pulse">
                Strategizing...
            </div>
        </div>
    );
};
