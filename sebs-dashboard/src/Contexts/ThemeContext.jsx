import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('eventplanner');
  const [brightness, setBrightness] = useState(100);
  const [loading, setLoading] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    loadThemePreferences();
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    if (!loading) {
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      localStorage.setItem('theme', currentTheme);
      syncWithBackend();
    }
  }, [currentTheme, loading]);

  // Apply brightness changes
  useEffect(() => {
    if (!loading) {
      document.documentElement.style.filter = `brightness(${brightness}%)`;
      localStorage.setItem('brightness', brightness.toString());
      syncWithBackend();
    }
  }, [brightness, loading]);

  const loadThemePreferences = async () => {
    try {
      // Load from localStorage first for instant application
      const savedTheme = localStorage.getItem('theme') || 'eventplanner';
      const savedBrightness = parseInt(localStorage.getItem('brightness') || '100');
      
      setCurrentTheme(savedTheme);
      setBrightness(savedBrightness);

      // Remove backend sync with auth token
      // If you want to support per-user preferences, move this logic to AuthContext or a user settings context
    } catch (err) {
      console.error('Failed to load theme preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncWithBackend = async () => {
    // Remove backend sync with auth token
    // If you want to support per-user preferences, move this logic to AuthContext or a user settings context
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'eventplanner' ? 'eventplanner-dark' : 'eventplanner';
    setCurrentTheme(newTheme);
  };

  const setTheme = (theme) => {
    setCurrentTheme(theme);
  };

  const resetToDefault = () => {
    setCurrentTheme('eventplanner');
    setBrightness(100);
  };

  const isLightTheme = currentTheme === 'eventplanner';
  const isDarkTheme = currentTheme === 'eventplanner-dark';

  const value = {
    currentTheme,
    brightness,
    isLightTheme,
    isDarkTheme,
    loading,
    toggleTheme,
    setTheme,
    setBrightness,
    resetToDefault,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};