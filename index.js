const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`✅ Conectado como ${client.user.tag}`);
});

/*
    ENVÍA EL PANEL UNA SOLA VEZ
    Cambia EL_ID_DEL_CANAL por el ID de tu canal.
*/
client.once('ready', async () => {

    const channel = client.channels.cache.get('1515473676437557370');

    if (!channel) return console.log('❌ Canal no encontrado');

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎫 Support Center')
        .setDescription(
            '**Select a category below**\n\n' +
            '💰 Buy\n' +
            '❓ Questions\n' +
            '🛠️ Support\n' +
            '🐛 Bug Report\n' +
            '🚨 Report User'
        )
        .setFooter({
            text: 'Ticket System'
        })
        .setTimestamp();

    const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_menu')
        .setPlaceholder('Select a category')
        .addOptions([
            {
                label: 'Buy',
                emoji: '💰',
                value: 'Buy'
            },
            {
                label: 'Questions',
                emoji: '❓',
                value: 'Questions'
            },
            {
                label: 'Support',
                emoji: '🛠️',
                value: 'Support'
            },
            {
                label: 'Bug Report',
                emoji: '🐛',
                value: 'Bug Report'
            },
            {
                label: 'Report User',
                emoji: '🚨',
                value: 'Report User'
            }
        ]);

    const row = new ActionRowBuilder()
        .addComponents(menu);

    await channel.send({
        embeds: [embed],
        components: [row]
    });

    console.log('✅ Panel enviado');
});

client.on('interactionCreate', async interaction => {

    // CREAR TICKET
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === 'ticket_menu'
    ) {

        const choice = interaction.values[0];

        const existing = interaction.guild.channels.cache.find(
            c => c.topic === `OWNER:${interaction.user.id}`
        );

        if (existing) {
            return interaction.reply({
                content: `⚠️ Ya tienes un ticket abierto: ${existing}`,
                ephemeral: true
            });
        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            topic: `OWNER:${interaction.user.id}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }
            ]
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 Ticket Created')
            .setDescription(
                `Welcome ${interaction.user}\n\n` +
                `📂 Category: **${choice}**\n\n` +
                `Describe your issue and a staff member will help you.`
            )
            .setThumbnail(
                interaction.user.displayAvatarURL()
            )
            .setTimestamp();

        const closeRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

        await channel.send({
            embeds: [ticketEmbed],
            components: [closeRow]
        });

        await interaction.reply({
            content: `✅ Ticket creado: ${channel}`,
            ephemeral: true
        });
    }

    // BOTÓN CERRAR
    if (
        interaction.isButton() &&
        interaction.customId === 'close_ticket'
    ) {

        const ownerId =
            interaction.channel.topic?.replace(
                'OWNER:',
                ''
            );

        const isOwner =
            interaction.user.id === ownerId;

        const isAdmin =
            interaction.member.permissions.has(
                PermissionsBitField.Flags.Administrator
            );

        if (!isOwner && !isAdmin) {
            return interaction.reply({
                content:
                    '❌ Solo el dueño del ticket o un administrador puede cerrarlo.',
                ephemeral: true
            });
        }

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_close')
                    .setLabel('Confirm')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('cancel_close')
                    .setLabel('Cancel')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({
            content:
                '⚠️ Are you sure you want to close this ticket?',
            components: [confirmRow],
            ephemeral: true
        });
    }

    // CONFIRMAR CIERRE
    if (
        interaction.isButton() &&
        interaction.customId === 'confirm_close'
    ) {

        await interaction.reply({
            content:
                '🔒 Ticket closing in 5 seconds...',
            ephemeral: true
        });

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }

    // CANCELAR
    if (
        interaction.isButton() &&
        interaction.customId === 'cancel_close'
    ) {

        await interaction.reply({
            content:
                '✅ Ticket closure cancelled.',
            ephemeral: true
        });
    }
});

client.login('MTUxNTU3MDA5Mzk4MjIyNDQyNA.GWTXIg.89_2q-iFDhv_1XJVBheHMqQSN6Bm3AapR85Ac8');