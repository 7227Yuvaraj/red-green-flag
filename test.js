/* 
const venom = require('venom-bot');

venom.create().then(client => {
  console.log("Venom Client is Ready");
  client.getAllChats().then(chats => {
    console.log(chats); // Logs all chats to inspect available properties
  }).catch(err => {
    console.error("Error getting chats:", err);
  });
}).catch(err => {
  console.error("Error creating client:", err);
});
*/ 
if (typeof client.getGroupMembers === 'function') {
    // The function exists
    const groupMembersIds = await client.getGroupMembers(groupId);
} else {
    console.error('getGroupMembers is not a function');
}









const venom = require('venom-bot');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const credentials = require('./path/to/your/credentials.json'); // Path to your credentials file

const sheetId = '1b5o9l4udjvlOWj5eZtb4DVCmERLMULAZor9MSYQMjF8';
const durationInMilliseconds = 604800000; // 7 days

const extractAndTransfer = async () => {
  try {
    // Connect to WhatsApp
    const client = await venom.create({
      session: 'session-name',
    });

    const groupId = 'GTaklOE71a8AdV9nSlQwje'; // Replace with the actual group ID
    const group = await client.getChatById(groupId);

    // Fetch group members
    const groupMembers = await client.getGroupMembersIds(groupId);

    // Fetch messages from the group
    const messages = await client.getAllMessagesInChat(groupId, true);

    // Create a Google Sheet instance
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];

    // Clear existing data and write headers
    await sheet.clear();
    await sheet.setHeaderRow(['Sender', 'Contact', 'Timestamp', 'Message']);

    // Write data to the sheet
    for (const message of messages) {
      const senderName = message.sender.pushname || message.sender.verifiedName || message.sender.formattedName;
      const senderNumber = groupMembers.find(member => member === message.sender.id.user)?.replace('@c.us', '');
      const timestamp = new Date(message.timestamp * 1000).toISOString();
      const text = message.body;

      await sheet.addRow([senderName, senderNumber, timestamp, text]);
    }

    console.log('Data transferred to Google Sheets successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Logout from WhatsApp
    await client.logout();
  }
};

// Set a timer to stop the script after the specified duration
setTimeout(() => {
  console.log('Script is stopping after the specified duration.');
  process.exit();
}, durationInMilliseconds);

// Start the extraction process
extractAndTransfer();
