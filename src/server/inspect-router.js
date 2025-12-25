const express = require('express');

try {
  const router = require('./routes/auth');
  console.log('router type:', typeof router);
  if (router && router.stack) {
    const routes = router.stack
      .filter(layer => layer.route)
      .map(layer => {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        return `${methods} ${layer.route.path}`;
      });
    console.log('Registered routes on router:\n', routes.join('\n') || '(none)');
  } else {
    console.log('Router has no stack (not an express router?)');
  }
} catch (err) {
  console.error('Error requiring ./routes/auth:', err && err.stack ? err.stack.split('\n').slice(0,6).join('\n') : err);
}
