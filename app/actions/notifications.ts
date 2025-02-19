'use server'

export async function sendPushNotification(formData: {
  full_name: string
  phone_number: string
  position: string
  trial_date: Date
  last_club: string | null
}) {
  const message = `
👤 ${formData.full_name}${formData.last_club ? ` (${formData.last_club})`: ''}
🗓️ ${formData.trial_date.toLocaleDateString('de-DE')}
⚙️ ${formData.position}
📞 ${formData.phone_number}
`
  try {
    await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER,
        message,
        title: '🔴 New Trial Request'
      }),
    })
  } catch (error) {
    console.error('Failed to send push notification:', error)
  }
} 
