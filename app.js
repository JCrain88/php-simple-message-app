// Data Structure stored in localStorage
// users: [{id, username, password, email, createdAt}]
// groups: [{id, name, createdBy, createdAt}]
// groupMembers: [{id, groupId, userId, joinedAt}]
// messages: [{id, senderId, recipientId, groupId, message, sentAt}]
// currentUser: {id, username}

let currentUser = null;
let activeConversation = null; // {type: 'direct'|'group', id: number}

// Initialize app
function initApp() {
    // Initialize localStorage if empty
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {id: 1, username: 'john', password: 'password123', email: 'john@example.com', createdAt: new Date().toISOString()},
            {id: 2, username: 'jane', password: 'password123', email: 'jane@example.com', createdAt: new Date().toISOString()},
            {id: 3, username: 'bob', password: 'password123', email: 'bob@example.com', createdAt: new Date().toISOString()}
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));

        const defaultGroups = [
            {id: 1, name: 'General Chat', createdBy: 1, createdAt: new Date().toISOString()}
        ];
        localStorage.setItem('groups', JSON.stringify(defaultGroups));

        const defaultGroupMembers = [
            {id: 1, groupId: 1, userId: 1, joinedAt: new Date().toISOString()},
            {id: 2, groupId: 1, userId: 2, joinedAt: new Date().toISOString()}
        ];
        localStorage.setItem('groupMembers', JSON.stringify(defaultGroupMembers));

        const defaultMessages = [
            {id: 1, senderId: 1, recipientId: 2, groupId: null, message: 'Hey Jane, how are you?', sentAt: new Date().toISOString()},
            {id: 2, senderId: 2, recipientId: 1, groupId: null, message: 'Hi John! I am doing great, thanks!', sentAt: new Date().toISOString()},
            {id: 3, senderId: 1, recipientId: null, groupId: 1, message: 'Welcome to the General Chat!', sentAt: new Date().toISOString()}
        ];
        localStorage.setItem('messages', JSON.stringify(defaultMessages));
    }

    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showChat();
    } else {
        showAuth();
    }

    document.body.classList.add('loaded');
}

// Auth Functions
function showAuth() {
    document.getElementById('authScreen').style.display = 'block';
    document.getElementById('chatScreen').style.display = 'none';
}

function showChat() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('chatScreen').style.display = 'block';
    document.getElementById('currentUsername').textContent = currentUser.username;
    loadSidebar();
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = {id: user.id, username: user.username};
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showChat();
    } else {
        showError('loginError', 'Invalid username or password');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const email = document.getElementById('signupEmail').value;

    const users = JSON.parse(localStorage.getItem('users'));

    if (users.find(u => u.username === username)) {
        showError('signupError', 'Username already exists');
        return;
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password,
        email,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showSuccess('signupSuccess', 'Account created successfully! You can now login.');
    document.getElementById('signupError').classList.add('d-none');

    setTimeout(() => {
        showLogin();
        document.getElementById('signupSuccess').classList.add('d-none');
    }, 2000);
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    activeConversation = null;
    showAuth();
    showLogin();
}

// Sidebar Functions
function loadSidebar() {
    loadUsersList();
    loadGroupsList();
}

function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users'));
    const otherUsers = users.filter(u => u.id !== currentUser.id);

    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    otherUsers.forEach(user => {
        const isActive = activeConversation && activeConversation.type === 'direct' && activeConversation.id === user.id;
        const userItem = document.createElement('a');
        userItem.href = '#';
        userItem.className = `user-item ${isActive ? 'active' : ''}`;
        userItem.innerHTML = `<strong>👤 ${escapeHtml(user.username)}</strong>`;
        userItem.onclick = (e) => {
            e.preventDefault();
            openDirectChat(user.id);
        };
        usersList.appendChild(userItem);
    });
}

function loadGroupsList() {
    const groups = JSON.parse(localStorage.getItem('groups'));
    const groupMembers = JSON.parse(localStorage.getItem('groupMembers'));
    const userGroups = groupMembers
        .filter(gm => gm.userId === currentUser.id)
        .map(gm => groups.find(g => g.id === gm.groupId))
        .filter(g => g); // Remove undefined

    const groupsList = document.getElementById('groupsList');
    groupsList.innerHTML = '';

    userGroups.forEach(group => {
        const isActive = activeConversation && activeConversation.type === 'group' && activeConversation.id === group.id;
        const groupItem = document.createElement('a');
        groupItem.href = '#';
        groupItem.className = `group-item ${isActive ? 'active' : ''}`;
        groupItem.innerHTML = `<strong>👥 ${escapeHtml(group.name)}</strong>`;
        groupItem.onclick = (e) => {
            e.preventDefault();
            openGroupChat(group.id);
        };
        groupsList.appendChild(groupItem);
    });
}

// Chat Functions
function openDirectChat(userId) {
    activeConversation = {type: 'direct', id: userId};
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.id === userId);

    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('activeChat').style.display = 'flex';
    document.getElementById('conversationTitle').textContent = `Chat with ${user.username}`;

    loadMessages();
    loadSidebar(); // Refresh to show active state
}

function openGroupChat(groupId) {
    activeConversation = {type: 'group', id: groupId};
    const groups = JSON.parse(localStorage.getItem('groups'));
    const group = groups.find(g => g.id === groupId);

    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('activeChat').style.display = 'flex';
    document.getElementById('conversationTitle').textContent = `Group: ${group.name}`;

    loadMessages();
    loadSidebar(); // Refresh to show active state
}

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('messages'));
    const users = JSON.parse(localStorage.getItem('users'));

    let filteredMessages = [];

    if (activeConversation.type === 'direct') {
        filteredMessages = messages.filter(m =>
            ((m.senderId === currentUser.id && m.recipientId === activeConversation.id) ||
                (m.senderId === activeConversation.id && m.recipientId === currentUser.id)) &&
            m.groupId === null
        );
    } else if (activeConversation.type === 'group') {
        filteredMessages = messages.filter(m => m.groupId === activeConversation.id);
    }

    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';

    if (filteredMessages.length === 0) {
        messagesList.innerHTML = '<div class="text-center text-muted mt-5"><p>No messages yet. Start the conversation!</p></div>';
        return;
    }

    filteredMessages.forEach(msg => {
        const sender = users.find(u => u.id === msg.senderId);
        const isSent = msg.senderId === currentUser.id;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${isSent ? 'message-sent' : 'message-received'}`;

        let messageHTML = '';
        if (!isSent) {
            messageHTML += `<strong>${escapeHtml(sender.username)}</strong><br>`;
        }
        messageHTML += escapeHtml(msg.message);
        messageHTML += `<div class="message-time">${formatDate(msg.sentAt)}</div>`;

        messageDiv.innerHTML = messageHTML;
        messagesList.appendChild(messageDiv);
    });

    // Scroll to bottom
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

function handleSendMessage(event) {
    event.preventDefault();
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();

    if (!messageText || !activeConversation) return;

    const messages = JSON.parse(localStorage.getItem('messages'));
    const newMessage = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        senderId: currentUser.id,
        recipientId: activeConversation.type === 'direct' ? activeConversation.id : null,
        groupId: activeConversation.type === 'group' ? activeConversation.id : null,
        message: messageText,
        sentAt: new Date().toISOString()
    };

    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));

    messageInput.value = '';
    loadMessages();
}

// Group Functions
function showCreateGroupModal() {
    const modal = new bootstrap.Modal(document.getElementById('createGroupModal'));
    modal.show();
    document.getElementById('groupName').value = '';
    document.getElementById('createGroupError').classList.add('d-none');
}

function handleCreateGroup(event) {
    event.preventDefault();
    const groupName = document.getElementById('groupName').value.trim();

    if (!groupName) {
        showError('createGroupError', 'Group name is required');
        return;
    }

    const groups = JSON.parse(localStorage.getItem('groups'));
    const newGroup = {
        id: groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1,
        name: groupName,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
    };

    groups.push(newGroup);
    localStorage.setItem('groups', JSON.stringify(groups));

    // Add creator as first member
    const groupMembers = JSON.parse(localStorage.getItem('groupMembers'));
    const newMember = {
        id: groupMembers.length > 0 ? Math.max(...groupMembers.map(gm => gm.id)) + 1 : 1,
        groupId: newGroup.id,
        userId: currentUser.id,
        joinedAt: new Date().toISOString()
    };
    groupMembers.push(newMember);
    localStorage.setItem('groupMembers', JSON.stringify(groupMembers));

    // Close modal and refresh
    bootstrap.Modal.getInstance(document.getElementById('createGroupModal')).hide();
    loadSidebar();
    openGroupChat(newGroup.id);
}

function showJoinGroupModal() {
    const modal = new bootstrap.Modal(document.getElementById('joinGroupModal'));
    modal.show();
    document.getElementById('joinGroupError').classList.add('d-none');
    document.getElementById('joinGroupSuccess').classList.add('d-none');
    loadAvailableGroups();
}

function loadAvailableGroups() {
    const groups = JSON.parse(localStorage.getItem('groups'));
    const groupMembers = JSON.parse(localStorage.getItem('groupMembers'));
    const users = JSON.parse(localStorage.getItem('users'));

    const availableGroupsList = document.getElementById('availableGroupsList');
    availableGroupsList.innerHTML = '';

    if (groups.length === 0) {
        availableGroupsList.innerHTML = '<p class="text-muted p-3">No groups available yet.</p>';
        return;
    }

    groups.forEach(group => {
        const isMember = groupMembers.some(gm => gm.groupId === group.id && gm.userId === currentUser.id);
        const creator = users.find(u => u.id === group.createdBy);
        const memberCount = groupMembers.filter(gm => gm.groupId === group.id).length;

        const groupItem = document.createElement('div');
        groupItem.className = 'list-group-item';
        groupItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">
                    # ${escapeHtml(group.name)}
                    ${isMember ? '<span class="badge bg-success">Joined</span>' : ''}
                </h6>
                <small class="text-muted">ID: ${group.id}</small>
            </div>
            <p class="mb-1">
                <small>
                    Created by: ${escapeHtml(creator.username)} | 
                    Members: ${memberCount}
                </small>
            </p>
            ${isMember ?
            `<button onclick="openGroupChatFromModal(${group.id})" class="btn btn-sm btn-primary">Open Chat</button>` :
            `<button onclick="joinGroup(${group.id})" class="btn btn-sm btn-outline-success">Join Group</button>`
        }
        `;
        availableGroupsList.appendChild(groupItem);
    });
}

function joinGroup(groupId) {
    const groupMembers = JSON.parse(localStorage.getItem('groupMembers'));

    // Check if already a member
    if (groupMembers.some(gm => gm.groupId === groupId && gm.userId === currentUser.id)) {
        showError('joinGroupError', 'You are already a member of this group');
        return;
    }

    const newMember = {
        id: groupMembers.length > 0 ? Math.max(...groupMembers.map(gm => gm.id)) + 1 : 1,
        groupId: groupId,
        userId: currentUser.id,
        joinedAt: new Date().toISOString()
    };

    groupMembers.push(newMember);
    localStorage.setItem('groupMembers', JSON.stringify(groupMembers));

    const groups = JSON.parse(localStorage.getItem('groups'));
    const group = groups.find(g => g.id === groupId);

    showSuccess('joinGroupSuccess', `Successfully joined group: ${group.name}`);
    loadAvailableGroups();
    loadSidebar();
}

function openGroupChatFromModal(groupId) {
    bootstrap.Modal.getInstance(document.getElementById('joinGroupModal')).hide();
    openGroupChat(groupId);
}

// Utility Functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('d-none');
    setTimeout(() => {
        element.classList.add('d-none');
    }, 5000);
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('d-none');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', initApp);