document.addEventListener('DOMContentLoaded', function() {
    // Event listener for sending message on Enter key press
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent the default action to avoid form submission
            sendMessage(); // Function to send the message
        }
    });

    // Event listener for the send button click
    document.getElementById('send-message').addEventListener('click', sendMessage);

    // Event listener for minimizing the chat
    document.getElementById('minimize-chat').addEventListener('click', function() {
        const chatWidget = document.getElementById('chat-widget');
        chatWidget.classList.toggle('minimized');
        // Adjust button content based on the widget's state
        this.textContent = chatWidget.classList.contains('minimized') ? '↑' : '↓';
    });    
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return; // Do nothing if the message is empty
    input.value = ''; // Clear input after sending

    // Display user's message
    displayMessage('You', message);

    // Send message to Cloudflare Worker and get response
    fetch('https://worker-cold-mode-0069.aicodelabsio.workers.dev/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: message })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayMessage('Bot', data.response.response); // Adjust based on your response structure
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('Bot', 'Sorry, there was an error.');
    });
}

function displayMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    // Check if the user is near the bottom of the chat to decide on auto-scrolling
    const isScrolledToBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 50; // 50 is a threshold

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    // Add the sender's name and message content
    const senderElement = document.createElement('span');
    senderElement.classList.add('sender');
    const iconElement = document.createElement('span');
    iconElement.classList.add(sender === 'You' ? 'user-icon' : 'bot-icon');
    messageElement.appendChild(iconElement);

    senderElement.textContent = `${sender}: `;
    messageElement.appendChild(senderElement);
    messageElement.appendChild(document.createTextNode(message));

    chatMessages.appendChild(messageElement);

    // Auto-scroll to bottom if the user is near the bottom already
    if (isScrolledToBottom) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    // If not near the bottom, do not auto-scroll to allow reading of previous messages
}

