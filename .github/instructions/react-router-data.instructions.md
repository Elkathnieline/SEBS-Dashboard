# React Router Data APIs: Loaders & Actions – Project Instructions

## Overview
This project uses React Router v6.4+ data APIs for route-based data loading and mutations. All data fetching and mutations should be handled via route `loader` and `action` functions, not inside component `useEffect` or event handlers.

## Key Conventions
- **Route Data**: Fetch data in route `loader` functions. Access with `useLoaderData()` in components.
- **Mutations**: Handle POST/PUT/DELETE via route `action` functions. Use `useFetcher()` or `useSubmit()` to trigger.
- **Error Handling**: Use route `errorElement` for loader/action errors. Do not use local error state for fetch failures.
- **Pending State**: Use `useNavigation()` or `useFetcher().state` for loading indicators.
- **Route Structure**: Prefer object-based route definitions for clarity and maintainability.

## Example Pattern
```js
// In main.jsx
import Management, { loader as managementLoader, action as managementAction } from './Routes/Management.jsx';

const router = createBrowserRouter([
  {
    path: '/management',
    element: <Management />, 
    loader: managementLoader,
    action: managementAction,
    errorElement: <ErrorPage />,
  },
  // ...other routes
]);
```

```js
// In Management.jsx
export async function loader({ request, params }) {
  // Fetch bookings, etc.
}
export async function action({ request, params }) {
  // Handle booking status updates, etc.
}
```

## Migration Steps
1. Move all data fetching logic from `useEffect` to route `loader` functions.
2. Move all mutation logic (e.g., booking status updates) to route `action` functions.
3. Use `useLoaderData()` and `useActionData()` in components instead of local state for server data.
4. Remove redundant local state and side effects related to data fetching.
5. Use `useFetcher()` for forms or buttons that trigger actions without navigation.
6. Handle errors and loading states using React Router's built-in hooks.

## Best Practices
- Keep loaders and actions pure (no side effects except data fetch/mutate).
- Always return JSON or Response objects from loaders/actions.
- Use `redirect()` for navigation after successful actions.
- Co-locate loader/action with their route component for maintainability.
- Test loaders/actions independently from UI logic.

## References
- [React Router Data APIs](https://reactrouter.com/en/main/routers/picking-a-router)
- [Loader and Action Docs](https://reactrouter.com/en/main/route/loader)
- [useFetcher Docs](https://reactrouter.com/en/main/hooks/use-fetcher)
