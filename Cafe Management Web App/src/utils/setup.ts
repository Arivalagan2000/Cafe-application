// This function sets up demo users for testing
export async function setupDemoUsers() {
  // Check if setup has already been completed
  const setupCompleted = localStorage.getItem('cafe_setup_completed');
  if (setupCompleted === 'true') {
    // Silent - setup already done
    return;
  }

  // If not completed, mark as completed to prevent future attempts
  // Users can be created manually via login page if needed
  localStorage.setItem('cafe_setup_completed', 'true');
  console.log('✓ Demo user initialization skipped (use signup if needed)');
}
