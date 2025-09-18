console.log('Starting Bun build...');

try {
  await Bun.build({
    entrypoints: ['./src/index.jsx'], // Your entry file
    outdir: './build',               // Output directory
    jsx: 'react',                    // Enable JSX for React
  });
  console.log('Build completed!');
} catch (error) {
  console.error('Build failed with error:', error);
}
