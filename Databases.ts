import * as mssql from 'mssql';

// @ts-ignore
import * as config from './config.json';
import * as commonTypes from './DataTypes/CommonTypes';
import {callbackify} from "util";

/**
 * Loads the Connection data from fields of a parsed JSON file
 */
let MSSQLConfig = {
    server: config.MSSQLConnectionInformation.server,
    user: config.MSSQLConnectionInformation.user,
    password: config.MSSQLConnectionInformation.password,
    database: config.MSSQLConnectionInformation.database
};

export namespace fnlog {
    // @ts-ignore
    let connectionPool = new mssql.ConnectionPool(MSSQLConfig)
    connectionPool.connect(err => {
        // ...
    })

    export function insertIntoFnLogTable(log: commonTypes.ctypes.FnLog) {
        const ps = new mssql.PreparedStatement(connectionPool);
        ps.input('ProgramName', mssql.NVarChar);
        ps.input('ProgramVersion', mssql.NVarChar);
        ps.input('FnLogVersion', mssql.NVarChar);
        ps.input('Title', mssql.NVarChar);
        ps.input('Description', mssql.NVarChar);
        ps.input('LogType', mssql.Int);
        ps.input('UUID', mssql.NVarChar);

        ps.prepare('Insert into Log (ProgramName, ProgramVersion, FnLogVersion, Title, Description, LogType, UUID) ' +
            'values (@ProgramName, @ProgramVersion, @FnLogVersion, @Title, @Description, @LogType, @UUID)', err => {
            ps.stream = true;

            ps.execute({
                ProgramName: log.ProgramName, ProgramVersion: log.ProgramVersion, FnLogVersion: log.FnLogVersion,
                Title: log.Title, Description: log.Description, LogType: log.LogType, Guid: log.UUID,
            }, (err, result) => {
                // ... error checks

                ps.unprepare(err => {
                    // ... error checks
                })
            })
        });
    }
    export  function getFnLogTable(filter :string) :any {
        return new Promise( ( resolve, reject ) => {
            let ps = new mssql.PreparedStatement(connectionPool);
            ps.input('UUID', mssql.NVarChar);

            ps.prepare('Select * from Log where UUID like %@UUID%', err => {
                ps.stream = true;

                ps.execute({
                    UUID: filter
                }, (err, result) => {
                    if ( err )
                        return reject( err );
                    resolve( result );


                    ps.unprepare(err => {
                        // ... error checks
                    })
                })
            });
        } );

    }


}
