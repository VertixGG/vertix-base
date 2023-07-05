import process from "process";

import pc from "picocolors";

import { ObjectBase } from "../bases/object-base";

import { Logger } from "../modules/logger";
import { Debugger } from "../modules/debugger";

import { PrismaClient } from "../../prisma-bot-client";

type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
}

export class PrismaBotInstance extends ObjectBase {
    private static instance: PrismaBotInstance;

    private logger: Logger;
    private debugger: Debugger;

    private client: PrismaClient;

    public static getName() {
        return "VertixBase/Prisma/PrismaBotInstance";
    }

    public static getInstance() {
        if ( ! PrismaBotInstance.instance ) {
            PrismaBotInstance.instance = new PrismaBotInstance();
        }

        return PrismaBotInstance.instance;
    }

    public static get $() {
        return PrismaBotInstance.getInstance();
    }

    public static getClient(): PrismaClient {
        const prisma = ( this as typeof PrismaBotInstance ).$;

        return prisma.client;
    }

    private constructor() {
        super();

        this.logger = new Logger( this );
        this.debugger = new Debugger( this );
        this.logger.addMessagePrefix( pc.blue( "Prisma" ) );

        let options = {};

        if ( "true" === process.env.DEBUG_PRISMA ) {
            options = {
                log: [
                    { level: "warn", emit: "event" },
                    { level: "info", emit: "event" },
                    { level: "error", emit: "event" },
                    { level: "query", emit: "event" },
                ],
            };
        }

        this.client = new PrismaClient( options );

        if ( "true" === process.env.DEBUG_PRISMA ) {
            // @ts-ignore
            this.client.$on( "warn", this.onWarn.bind( this ) ); // @ts-ignore
            this.client.$on( "info", this.onInfo.bind( this ) ); // @ts-ignore
            this.client.$on( "error", this.onError.bind( this ) ); // @ts-ignore
            this.client.$on( "query", this.onQuery.bind( this ) );
        }
    }

    public async connect() {
        this.logger.log( "constructor", "Connecting to database..." );

        return this.client.$connect().catch( ( error ) => {
            this.logger.error( "constructor", "Failed to connect to database", error );
        } );
    }

    private async onError( error: any ) {
        this.logger.error( this.onError, "", error );
    }

    private async onInfo( message: any ) {
        this.logger.info( this.onInfo, "", message );
    }

    private async onQuery( data: QueryEvent ) {
        this.debugger.dumpDown( this.onQuery, data.query );
    }

    private async onWarn( message: any ) {
        this.logger.warn( this.onWarn, "", message );
    }
}
