const venom = require('venom-bot');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const credentials = {
  client_email: 'redflag-greenflag@loyal-channel-433412-r5.iam.gserviceaccount.com',
  private_key: '13349836e2ced51a3d17d1ffce651d033283052d' 
};

const sheetId = '1b5o9l4udjvlOWj5eZtb4DVCmERLMULAZor9MSYQMjF8';

//(7 days)
const durationInMilliseconds = 604800000;

const extractAndTransfer = async () => {
  try {
    // Replace with your actual session file path
    //const session = 'path/to/your/session.json';

    // Connect to WhatsApp
    // const client = await venom.connect({
    // session: session
    //});
    const client = await venom.create({
      session: 'session-name', 
    }); // Create a new Venom client instance
    //await client.initialize(session); 
    //await client.session.restore(); // restoreing session from session file 
    // Get the group ID
    // const groupId = await client.getGroupInfoByInviteLink('https://chat.whatsapp.com/GTaklOE71a8AdV9nSlQwje');
    const groupId = 'GTaklOE71a8AdV9nSlQwje'; // Replace with the actual group ID
    const group = await client.getChatById(groupId); // Get the group chat


    // Fetch group members
    //const groupMembers = await client.getGroupMembers(groupId);
    //const groupMembers = await group.getMembers();
    //const groupMembers = await group.getParticipants();
    const groupMembers = await client.getAllChats(groupId);
    // Extract messages from the group
    const messages = await client.getAllMessagesInChat(groupId,true);
    //const messages = await client.getMessages(groupId);
    //const messages = await group.fetchMessages();
    // Create a Google Sheet
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    // Get the first sheet
    //const sheet = doc.sheets[0];
    const sheet = doc.sheetsByIndex[0];
    // Clear existing data
    await sheet.clear();

    // Write headers
    // await sheet.addRow(['Sender', 'Contact', 'Timestamp', 'Message']);
    await sheet.setHeaderRow(['Sender', 'Contact', 'Timestamp', 'Message']);
    // Write data
    /*for (const message of messages) {
      const senderName = message.sender.name;
      const senderNumber = groupMembers.find(member => member.name === senderName)?.number;
      const timestamp = message.timestamp;
      const text = message.body;

      await sheet.addRow([senderName, senderNumber, timestamp, text]);
    } */
      for (const message of messages) {
        //const senderName = message.sender.pushname;
        //const senderNumber = groupMembers.find(member => member.id.user === message.sender.id.user)?.id.user;
        const senderName = message.sender.pushname || message.sender.verifiedName || message.sender.formattedName;
        const senderNumber = groupMembers.find(member => member === message.sender.id.user)?.replace('@c.us', '');
        const timestamp = new Date(message.timestamp * 1000).toISOString(); // Convert timestamp to a readable format
        const text = message.body;
  
        await sheet.addRow([senderName, senderNumber, timestamp, text]);
      }

    console.log('Data transferred to Google Sheets successfully.');
  } catch (error) {
    console.error('Error:', error);
    // You can add specific error handling here based on the encountered error message
  } finally {
    // Disconnect from WhatsApp
    //await client.disconnect();
    //await client.close();
    //await client.session.logout();
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
