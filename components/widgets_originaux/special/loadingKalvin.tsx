


const LoadingKalvin = () => {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 rounded-full" />
                <div className="w-16 h-16 border-4 border-[#23BE31] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <p className="text-gray-500 font-bold animate-pulse text-sm">Chargement des données...</p>
        </div>
    );
};
export default LoadingKalvin;