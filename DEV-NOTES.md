
## Usage

1. **Register** a new account or use existing test accounts
2. **Login** with your credentials
3. **Send Direct Messages**: Click on a user from the sidebar
4. **Create Group**: Click "Create Group" button
5. **Join Group**: Click "Join Group" and select from available groups
6. **View Messages**: Messages are loaded instantly from localStorage

## Data Storage

All data is stored in browser's localStorage:
- `users` - User accounts
- `groups` - Group chats
- `groupMembers` - Group membership relations
- `messages` - All messages (direct and group)
- `currentUser` - Currently logged in user

## Clearing Data

To reset the application:
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh the page

## Browser Compatibility

Works with all modern browsers that support:
- localStorage API
- ES6 JavaScript
- CSS Flexbox

Tested on: Chrome, Firefox, Safari, Edge

## Limitations

⚠️ **This is a client-side demo application!**

- Data is stored locally in your browser only
- No real-time sync between users
- Data is lost if localStorage is cleared
- Not suitable for production use
- No encryption or secure authentication

## Branch Structure

- `main` - This HTML/CSS/JS version
- `procedural-php` - Procedural PHP version with SQLite
- `mvc-php` - MVC/OOP PHP version with SQLite