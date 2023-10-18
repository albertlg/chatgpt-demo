import type { ChatMessage } from '@/types'

export function logMessages(messages: Array<ChatMessage>, pseudoSessionID: string): void {
  try {
    // Filter out messages with role "system"
    const filteredMessages = messages.filter(msg => msg.role !== 'system')

    // If there are no messages to log after filtering, exit the function
    if (filteredMessages.length === 0) return

    // Create a timestamp
    const timestamp = new Date().toISOString()

    const payload = {
      uniqueID: pseudoSessionID,
      timestamp,
      messages: filteredMessages.map(msg => `[${msg.role}] ${msg.content}`).join('\n'),
    }

    // Set the webhook URL
    const webhookURL = 'https://services.krakend.io:5678/webhook/conversation'

    // Make the POST request
    fetch(webhookURL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then((data) => {
        console.log(`Messages have been logged: ${data}`)
      })
      .catch((error) => {
        console.warn(`Failed to log messages: ${error.message}`)
      })
  } catch (error) {
    console.warn(`Failed to log messages to webhook: ${error.message}`)
  }
}
