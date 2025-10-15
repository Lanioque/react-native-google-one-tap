#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Post-install script to automatically inject dependencies
 * into the host app's build.gradle file
 */

const DEPENDENCIES = [
  "androidx.credentials:credentials:1.3.0",
  "androidx.credentials:credentials-play-services-auth:1.3.0", 
  "com.google.android.libraries.identity.googleid:googleid:1.1.0",
  "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0"
];

const COMMENT = "    // Auto-injected by react-native-google-one-tap";

function findProjectRoot() {
  let currentDir = process.cwd();
  
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      const packageJson = JSON.parse(fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8'));
      if (packageJson.name && !packageJson.name.includes('react-native-google-one-tap')) {
        return currentDir;
      }
    }
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}

function injectDependencies() {
  const projectRoot = findProjectRoot();
  
  if (!projectRoot) {
    console.log('⚠️  Could not find React Native project root');
    return;
  }
  
  const buildGradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
  
  if (!fs.existsSync(buildGradlePath)) {
    console.log('⚠️  Could not find android/app/build.gradle file');
    return;
  }
  
  let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Check if dependencies are already injected
  if (buildGradleContent.includes('androidx.credentials:credentials:1.3.0')) {
    console.log('ℹ️  Google One Tap dependencies already present');
    return;
  }
  
  console.log('🔧 Auto-injecting Google One Tap dependencies...');
  
  // Find the dependencies block and inject our dependencies
  const dependenciesRegex = /(dependencies\s*\{)([\s\S]*?)(^\s*\})/m;
  const match = buildGradleContent.match(dependenciesRegex);
  
  if (match) {
    const [fullMatch, openingBrace, existingDeps, closingBrace] = match;
    
    // Create the new dependencies block
    const newDependenciesBlock = [
      openingBrace,
      existingDeps,
      COMMENT,
      ...DEPENDENCIES.map(dep => `    implementation '${dep}'`),
      closingBrace
    ].join('\n');
    
    // Replace the dependencies block
    buildGradleContent = buildGradleContent.replace(dependenciesRegex, newDependenciesBlock);
    
    // Write back to file
    fs.writeFileSync(buildGradlePath, buildGradleContent);
    
    console.log('✅ Dependencies auto-injected successfully!');
    console.log('📋 Added dependencies:');
    DEPENDENCIES.forEach(dep => console.log(`   - ${dep}`));
    console.log('');
    console.log('🔄 Please run: cd android && ./gradlew clean && cd .. && npx react-native run-android');
  } else {
    console.log('⚠️  Could not find dependencies block in build.gradle');
    console.log('📝 Please manually add these dependencies to android/app/build.gradle:');
    console.log('');
    DEPENDENCIES.forEach(dep => console.log(`    implementation '${dep}'`));
  }
}

// Run the injection
injectDependencies();
