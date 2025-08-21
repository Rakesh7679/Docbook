// Clear localStorage for fresh admin login
localStorage.removeItem('aToken');
localStorage.removeItem('dToken');
console.log('LocalStorage cleared');
location.reload();
