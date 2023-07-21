import { GuildChannel, User as DiscordUser } from "discord.js";

import { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";

import { Channel as ChannelDB, ChannelData as ChannelDataDB, GuildData as GuildDataDB } from "../../prisma-bot-client";

export interface APIDataTypeGenericError {
    error: true,
    code?: number,
    message: string
}

export interface APIDataTypeGuild {
    channelsDB: ChannelDB[];
    guildRS: RESTAPIPartialCurrentUserGuild,
}

export interface APIDataTypeMasterChannel {
    dataDB: ChannelDataDB[],
    channelDB: ChannelDB,

    dynamicChannelsDB: ChannelDB[],

    channelDS: GuildChannel,
    userOwnerDS: DiscordUser,
}

export interface APIDataTypeGuild {
    guildRS: RESTAPIPartialCurrentUserGuild,
    masterChannelsAP: APIDataTypeMasterChannel[],
    dataDB: GuildDataDB[],
}


export type APIDataTypeGetGuilds = APIDataTypeGenericError | APIDataTypeGuild[];
export type APIDataTypeGetGuild = APIDataTypeGenericError | APIDataTypeGuild;
