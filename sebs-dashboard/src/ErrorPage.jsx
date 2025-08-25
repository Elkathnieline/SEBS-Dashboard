import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError(); // Make sure this line exists

  console.error(error);

  return (
    <div id="error-page" className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-error mb-4">Oops!</h1>
        <p className="text-lg mb-4">Sorry, an unexpected error has occurred.</p>
        <p className="text-base-content/60">
          <i>{error?.statusText || error?.message || "Unknown error"}</i>
        </p>
        <div className="mt-6">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}