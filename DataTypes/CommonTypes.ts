export namespace ctypes {
    export class SimpleResult {
        Result: boolean;

        constructor(res: boolean) {
            this.Result = res;
        }

        toJSON() {
            return JSON.stringify(this);
        }
    }

    export class FnLog {
        ProgramName: string;
        ProgramVersion: string;
        FnLogVersion: string;
        Title: string;
        Description: string;
        LogType: number;
        UUID: string;

        constructor(){};

    }
}
