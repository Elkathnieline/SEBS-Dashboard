import { Sun, Moon, Lightbulb, Settings as SettingsIcon, Palette, Check, RotateCcw } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import useAuth from "../Hooks/UseAuth";

export default function Settings() {
  // Safely destructure with fallback values
  const authData = useAuth();
  const user = authData?.user || null;
  
  const { 
    currentTheme, 
    brightness, 
    isLightTheme, 
    isDarkTheme, 
    loading,
    toggleTheme, 
    setBrightness, 
    resetToDefault,
    setTheme
  } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDarkTheme ? 'bg-gray-900' : 'bg-base-100'}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`skeleton h-8 w-48 mb-4 ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
          <div className={`skeleton h-4 w-64 mb-8 ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`skeleton h-80 w-full ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
            <div className={`skeleton h-80 w-full ${isDarkTheme ? 'bg-gray-700' : ''}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-base-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <SettingsIcon size={24} className="text-primary-content" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                Settings
              </h1>
              <p className={`${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                Configure your dashboard preferences
                {user && ` - Welcome back, ${user.username || user.name || 'User'}!`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Settings Card */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDarkTheme 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-base-200 border-base-300'
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Palette size={20} className="text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                    Theme
                  </h2>
                  <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                    Choose your appearance
                  </p>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className={`rounded-xl p-4 mb-6 ${
                isDarkTheme ? 'bg-gray-900' : 'bg-base-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isLightTheme ? 
                      <Sun size={24} className="text-yellow-400" /> : 
                      <Moon size={24} className="text-blue-400" />
                    }
                    <div>
                      <p className={`font-medium ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                        {isLightTheme ? 'Light Mode' : 'Dark Mode'}
                      </p>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                        Currently using {isLightTheme ? 'light' : 'dark'} theme
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sun size={16} className={isLightTheme ? 'text-yellow-400' : 'text-gray-600'} />
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={isDarkTheme}
                      onChange={toggleTheme}
                    />
                    <Moon size={16} className={isDarkTheme ? 'text-blue-400' : 'text-gray-600'} />
                  </div>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                    isLightTheme ? 'border-blue-500 bg-blue-50' : 'border-gray-600 bg-gray-700'
                  }`} 
                  onClick={() => setTheme('eventplanner')}
                >
                  <div className="w-full h-16 bg-white rounded-md mb-2 flex items-center justify-center">
                    <Sun size={20} className="text-gray-800" />
                  </div>
                  <p className={`text-center text-sm ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                    Light
                  </p>
                </div>
                <div 
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                    isDarkTheme ? 'border-blue-500 bg-blue-900' : 'border-gray-600 bg-gray-100'
                  }`} 
                  onClick={() => setTheme('eventplanner-dark')}
                >
                  <div className="w-full h-16 bg-gray-900 rounded-md mb-2 flex items-center justify-center">
                    <Moon size={20} className="text-white" />
                  </div>
                  <p className={`text-center text-sm ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                    Dark
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Brightness Settings Card */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDarkTheme 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-base-200 border-base-300'
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Lightbulb size={20} className="text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                    Brightness
                  </h2>
                  <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                    Adjust display brightness
                  </p>
                </div>
              </div>

              {/* Brightness Display */}
              <div className={`rounded-xl p-4 mb-6 ${
                isDarkTheme ? 'bg-gray-900' : 'bg-base-100'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-medium ${isDarkTheme ? 'text-white' : 'text-base-content'}`}>
                    Current Level
                  </span>
                  <div className="px-3 py-1 rounded-lg font-mono text-sm bg-green-600/20 text-green-400">
                    {brightness}%
                  </div>
                </div>

                {/* Brightness Slider */}
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="range range-success w-full"
                    step="1"
                  />
                  
                  {/* Range markers */}
                  <div className={`flex justify-between text-xs ${isDarkTheme ? 'text-gray-500' : 'text-base-content/40'}`}>
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[25, 50, 75, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBrightness(preset)}
                    className={`btn btn-sm transition-all hover:scale-105 ${
                      brightness === preset 
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                        : isDarkTheme
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                          : 'btn-outline'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>

              {/* Brightness Visual Indicator */}
              <div className={`rounded-xl p-4 ${
                isDarkTheme ? 'bg-gray-900' : 'bg-base-100'
              }`}>
                <div className="flex items-center gap-3">
                  <Lightbulb size={16} className={isDarkTheme ? 'text-gray-400' : 'text-base-content/60'} />
                  <div className={`flex-1 rounded-full h-2 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${brightness}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                    Brightness
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={resetToDefault}
            className={`btn gap-2 hover:scale-105 transition-transform ${
              isDarkTheme 
                ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                : 'btn-outline'
            }`}
          >
            <RotateCcw size={16} />
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}