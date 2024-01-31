import type { ConfigCommands } from "../../types/commands";

export default <ConfigCommands>{
    name: "syncdatabase",
    alias: ["syncdb"],
    category: "owner",
    description: "Sync Database",
    isTeam: true,
    async run({ Chisato, from, message, Database }) {
        const groupDatabase = Database.Group.getAll();
        const groupDatabaseIDs = (await groupDatabase).map((v) => v.groupId);
        const groupSettingDatabase = Database.GroupSetting.getAll();
        const groupSettingDatabaseIDs = (await groupSettingDatabase).map((v) => v.groupId);
        const groupFetch = await Chisato.groupFetchAllParticipating();
        const groupFetchIDs = Object.keys(groupFetch);
        await Chisato.sendText(
            from,
            `Sync Database Started!\nTotal Group: ${groupDatabaseIDs.length}\nTotal Group Setting: ${groupSettingDatabaseIDs.length}`
        );
        for (let i = 0; i < groupDatabaseIDs.length; i++) {
            if (groupFetchIDs.includes(groupDatabaseIDs[i])) {
                const groupMetadata = groupFetch[groupDatabaseIDs[i]];
                delete groupMetadata.id;
                delete groupMetadata.subjectOwner;
                delete groupMetadata.subjectTime;
                delete groupMetadata.descId;
                groupMetadata.ephemeralDuration = groupMetadata.ephemeralDuration || 0;
                9;
                await Database.Group.update(groupDatabaseIDs[i], {
                    ...groupMetadata,
                }).catch(async () => {
                    await Database.Group.delete(groupDatabaseIDs[i]);
                    await Database.Group.upsert(Chisato, groupDatabaseIDs[i]);
                });
            } else {
                await Database.Group.delete(groupDatabaseIDs[i]);
            }
            if (!groupFetchIDs.includes(groupSettingDatabaseIDs[i])) {
                await Database.GroupSetting.delete(groupSettingDatabaseIDs[i]);
            }
        }
        const groupDatabaseAfter = Database.Group.getAll();
        const groupSettingDatabaseAfter = Database.GroupSetting.getAll();
        Chisato.sendText(
            from,
            `Sync Database Done!\nTotal Group: ${(await groupDatabaseAfter).length}\nTotal Group Setting: ${
                (await groupSettingDatabaseAfter).length
            }\nTotal Group Deleted: ${
                (await groupDatabase).length - (await groupDatabaseAfter).length
            }\nTotal Group Setting Deleted: ${
                (await groupSettingDatabase).length - (await groupSettingDatabaseAfter).length
            }`
        );
    },
};
