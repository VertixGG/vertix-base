import { ManagerDataBase } from "../bases/manager-data-base";

import { GuildModel } from "../models/guild-model";

import { badwordsSomeUsed } from "../utils/badwords";
import { isDebugOn } from "../utils/debug";

import { DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } from "../definitions/master-channel-defaults";
import { DEFAULT_GUILD_SETTINGS_KEY_BADWORDS } from "../definitions/guild-data-keys";

import {
    DEFAULT_BADWORDS,
    DEFAULT_BADWORDS_INITIAL_VALUE,
    DEFAULT_BADWORDS_SEPARATOR
} from "../definitions/badwords-defaults";

interface IGuildSettings {
    maxMasterChannels: number;
}

export class GuildDataManager extends ManagerDataBase<GuildModel> {
    private static instance: GuildDataManager;

    public static getName() {
        return "VertixBase/Managers/GuildData";
    }

    public static getInstance(): GuildDataManager {
        if ( ! GuildDataManager.instance ) {
            GuildDataManager.instance = new GuildDataManager();
        }
        return GuildDataManager.instance;
    }

    public static get $() {
        return GuildDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugOn( "CACHE", GuildDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public async getAllSettings( guildId: string, cache = false ): Promise<IGuildSettings> {
        const data = await this.getSettingsData(
            guildId,
            null,
            cache,
            true
        );

        if ( data?.object ) {
            return data.object;
        }

        return {
            maxMasterChannels: DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS,
        };
    }

    public async getBadwords( guildId: string ): Promise<string[]> {
        const badwordsDB = await this.getData( {
            ownerId: guildId,
            key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
            default: null,
            // # Note: We don't want to cache the badwords because we want to be able to update them on the fly.
            cache: false,
        }, true );

        if ( badwordsDB?.values ) {
            return badwordsDB.values;
        }

        return DEFAULT_BADWORDS;
    }

    public async getBadwordsFormatted( guildId: string ): Promise<string> {
        return ( await this.getBadwords( guildId ) )
            .join( DEFAULT_BADWORDS_SEPARATOR ) || DEFAULT_BADWORDS_INITIAL_VALUE;
    }

    public async setBadwords( guildId: string, badwords: string[] | undefined ) {
        const oldBadwords = await this.getBadwordsFormatted( guildId );

        if ( ! badwords?.length ) {
            try {
                await this.deleteData( {
                    ownerId: guildId,
                    key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                }, true );
            } catch ( e ) {
                this.logger.error( this.setBadwords, "", e );
            }

            return;
        }

        await this.setData( {
            ownerId: guildId,
            key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
            default: badwords,
        }, true );

        return {
            oldBadwords,
            newBadwords: badwords.join( DEFAULT_BADWORDS_SEPARATOR )
        };
    }

    public async hasSomeBadword( guildId: string, content: string ): Promise<string | null> {
        return badwordsSomeUsed( content, await this.getBadwords( guildId ) );
    }

    public removeFromCache( ownerId: string ) {
        this.logger.debug( this.removeFromCache,
            `Removing guild data from cache for ownerId: '${ ownerId }'`
        );

        this.deleteCacheWithPrefix( ownerId );
    }

    protected getSettingsKey() {
        return "settings";
    }

    protected getDataSourceModel() {
        return GuildModel.getInstance();
    }
}
