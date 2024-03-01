const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');
const nodeHtmlToImage = require('node-html-to-image');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_filter')
        .setDescription('Adds filter(s) to your filter list'),
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        try {
            const filterString = await mysqlFunctions.fetchUserFilters(user_id);
            let messageContent;

            if (filterString) {
                const parsed = mysqlFunctions.parseFilter(filterString);
                const formattedFilterString = parsed.map(item => `<li>${item}</li>`).join('') + '\n';
                const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Poppins', Arial, sans-serif;
        background: #2C2F33;
        color: white;
        padding: 20px;
      }
      ul {
        list-style-type: none;
      }
      li {
        margin: 10px 0;
        border-bottom: 1px solid #fff;
        padding: 5px;
      }
    </style>
</head>
<body>
    <h2>Your Filters:</h2>
    <ul>${formattedFilterString}</ul>
</body>
</html>
`;
                const image = await nodeHtmlToImage({
                    html: htmlTemplate,
                    quality: 100,
                    type: 'png',
                    encoding: 'buffer',
                    puppeteerArgs: {
                        args: ['--no-sandbox', '--disable-setuid-sandbox'], 
                    },
                });

                const attachment = new AttachmentBuilder(image, { name: 'filters.png' });
                await interaction.reply({ files: [attachment] });
            } else {
                messageContent = 'You don\'t have any Filters';
                await interaction.reply(messageContent);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply('An error occurred while fetching your filter.');
        }
    },
};
