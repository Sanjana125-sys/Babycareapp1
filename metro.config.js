// D:\SanjanaMernPrograms\BabyCareApp\metro.config.js

// 1. Import necessary functions using CommonJS require
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

// 2. Get the default configuration object.
// We are using the synchronous getDefaultConfig here.
const config = getDefaultConfig(__dirname);

// 3. Apply the NativeWind wrapper to the 'config' object
// and export the result using module.exports.
module.exports = withNativeWind(config, {
  // Ensure the path to your global CSS file is correct.
  // './global.css' is typical for a basic setup.
  input: './global.css', 
});