#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Manual setup script to inject dependencies
 * Run this if the post-install script doesn't work
 */

const DEPENDENCIES = [
  "androidx.credentials:credentials:1.3.0",
  "androidx.credentials:credentials-play-services-auth:1.3.0", 
  "com.google.android.libraries.identity.googleid:googleid:1.1.0",
  "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0"
];

function setupDependencies() {
  console.log('🔧 Setting up Google One Tap dependencies...\n');
  
  const buildGradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');
  
  if (!fs.existsSync(buildGradlePath)) {
    console.log('❌ Error: android/app/build.gradle not found');
    console.log('   Please run this script from your React Native project root');
    process.exit(1);
  }
  
  let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Check if dependencies are already present
  if (buildGradleContent.includes('androidx.credentials:credentials:1.3.0')) {
    console.log('✅ Dependencies already present in build.gradle');
    return;
  }
  
  // Find dependencies block
  const dependenciesRegex = /(dependencies\s*\{)([\s\S]*?)(^\s*\})/m;
  const match = buildGradleContent.match(dependenciesRegex);
  
  if (!match) {
    console.log('❌ Error: Could not find dependencies block in build.gradle');
    console.log('📝 Please manually add these dependencies:');
    console.log('');
    DEPENDENCIES.forEach(dep => console.log(`    implementation '${dep}'`));
    process.exit(1);
  }
  
  const [fullMatch, openingBrace, existingDeps, closingBrace] = match;
  
  // Create new dependencies block
  const newDependenciesBlock = [
    openingBrace,
    existingDeps,
    '    // Auto-injected by react-native-google-one-tap',
    ...DEPENDENCIES.map(dep => `    implementation '${dep}'`),
    closingBrace
  ].join('\n');
  
  // Replace dependencies block
  buildGradleContent = buildGradleContent.replace(dependenciesRegex, newDependenciesBlock);
  
  // Write back to file
  fs.writeFileSync(buildGradlePath, buildGradleContent);
  
  console.log('✅ Dependencies injected successfully!');
  console.log('📋 Added dependencies:');
  DEPENDENCIES.forEach(dep => console.log(`   - ${dep}`));
  console.log('');
  console.log('🔄 Next steps:');
  console.log('   1. cd android && ./gradlew clean');
  console.log('   2. cd .. && npx react-native run-android');
}

setupDependencies();
