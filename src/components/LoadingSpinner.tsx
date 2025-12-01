export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
