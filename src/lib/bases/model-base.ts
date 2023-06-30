import { PrismaClient as PrismaBotClient } from "../../prisma-bot-client";
import { PrismaClient as PrismaApiClient } from "../../prisma-api-client";

import { Debugger } from "../modules/debugger";

import { CacheBase } from "./cache-base";
import { InitializeBase } from "./initialize-base";

type PossibleClients = PrismaBotClient | PrismaApiClient;

export abstract class ModelBaseCached<TPrismaClient extends PossibleClients, TCacheResult> extends CacheBase<TCacheResult> {
    protected prisma: TPrismaClient;

    protected debugger: Debugger;

    protected constructor( shouldDebugCache = true, shouldDebugModel = true ) {
        super( shouldDebugCache );

        this.prisma = this.getClient();

        this.debugger = new Debugger( this, "", shouldDebugModel );
    }

    protected abstract getClient(): TPrismaClient;
}

export abstract class ModelBase<TPrismaClient extends PossibleClients> extends InitializeBase {
    protected prisma: TPrismaClient;

    protected debugger: Debugger;

    protected constructor( shouldDebugCache = true, shouldDebugModel = true ) {
        super();

        this.prisma = this.getClient();

        this.debugger = new Debugger( this, "", shouldDebugModel );
    }

    protected abstract getClient(): TPrismaClient;
}

