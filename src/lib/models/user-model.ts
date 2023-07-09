import { Prisma, User } from "../../prisma-bot-client";

import { ModelDataBase } from "../bases/model-data-base";

import { PrismaBotInstance } from "../prisma/prisma-bot-instance";

import { isDebugOn } from "../utils/debug";

const client = PrismaBotInstance.getClient();

export class UserModel extends ModelDataBase<typeof client.user, typeof client.userData, User> {
    private static instance: UserModel;

    public static getName(): string {
        return "Vertix/Models/UserModel";
    }

    public static getInstance(): UserModel {
        if ( ! UserModel.instance ) {
            UserModel.instance = new UserModel();
        }

        return UserModel.instance;
    }

    public static get $() {
        return UserModel.getInstance();
    }

    public constructor(
        shouldDebugCache = isDebugOn( "CACHE", UserModel.getName() ),
        shouldDebugModel = isDebugOn( "MODEL", UserModel.getName() )
    ) {
        super( shouldDebugCache, shouldDebugModel );
    }

    public async ensure( args: Prisma.UserCreateArgs, shouldGetFromCache = true, shouldCacheSave = true ) {
        const userId = args.data.userId;

        this.logger.log( this.ensure,
            `User id: '${ args.data.userId }' username: '${ args.data.username }' - Ensuring entry exists`
        );

        // Check if the user exists in cache.
        if ( shouldGetFromCache ) {
            const cached = this.getCache( userId );

            if ( cached ) {
                this.logger.log( this.ensure,
                    `User id: '${ userId }' - Found in cache`
                );

                return cached;
            }
        }

        if ( ! args.data.username ) {
            args.data.username = "";
        }

        const result = await this.ownerModel.upsert( {
            // # CRITICAL: This is the field that is used to identify the user.
            where: { userId },

            create: args.data,
            update: args.data
        } );

        if ( shouldCacheSave ) {
            this.setCache( result.userId, result );
        }

        return result;
    }

    public async transferData( userId: string, newOwnerId: string ) {
        this.logger.log( this.transferData,
            `User id: '${ userId }' - Transferring data to new owner id: '${ newOwnerId }'`
        );

        const oldUser = await this.getOwnerModel().findUnique( {
            where: { userId }
        } );

        if ( ! oldUser ) {
            this.logger.error( this.transferData,
                `User id: '${ userId }' - User not found`
            );
            return false;
        }

        const newUser = await this.ensure( {
            data: {
                userId: newOwnerId,
            }
        } );

        // Delete caches.
        this.deleteCache( userId );
        this.deleteCache( newOwnerId );

        await this.getDataModel().updateMany( {
            where: { ownerId: oldUser.id },
            data: { ownerId: newUser.id }
        } );

        return true;
    }

    protected getClient() {
        return client;
    }

    protected getDataModel(): typeof client.userData {
        return client.userData;
    }

    protected getOwnerModel(): typeof client.user {
        return client.user;
    }

    protected getOwnerIdFieldName(): string {
        return "userId";
    }
}
