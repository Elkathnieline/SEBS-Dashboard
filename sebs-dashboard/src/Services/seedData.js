// This file provides mock data and a seeding function for local testing.

export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    roles: ["admin"],
    accessToken: "mock-admin-token",
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    roles: ["user"],
    accessToken: "mock-user-token",
  },
];

export const mockDashboardData = [
  { id: 1, title: "Widget 1", value: 42 },
  { id: 2, title: "Widget 2", value: 17 },
];

export function seedMockData() {
  localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
  localStorage.setItem("mockDashboardData", JSON.stringify(mockDashboardData));
}

// Call this in your test setup or manually in the browser console:
// seedMockData();
